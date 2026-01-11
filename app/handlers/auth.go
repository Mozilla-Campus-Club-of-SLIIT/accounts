package handlers

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/gofrs/uuid"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
	"github.com/sliitmozilla/accounts/app/middlewares"
	"github.com/sliitmozilla/accounts/config"
	"github.com/sliitmozilla/accounts/db"
	"github.com/sliitmozilla/accounts/db/models"
	apiErrors "github.com/sliitmozilla/accounts/errors"
	"github.com/sliitmozilla/accounts/helpers"
)

// @tags        Auth
// @summary     Get current session
// @description Get the current session using the access token
// @accept      json
// @produce     json
// @security	AccessToken
// @success 	200 {object} helpers.SuccessResponseModel{data=object{id=string,roles=[]string}} "Session data"
// @failure		401 "Not logged in or invalid token"
// @failure     500 "Internal Server error"
// @router      /session [GET]
func GetSession(w http.ResponseWriter, r *http.Request) {
	u := r.Context().Value(middlewares.UserContext{}).(*models.UserModel)
	helpers.Response(w, http.StatusOK, map[string]any{
		"id":    u.ID.String(),
		"roles": u.Roles,
	})
}

func createAndStoreCode(id string) ([]byte, error) {
	c := config.GetConfig()

	code := make([]byte, 10)
	rand.Read(code)
	redisClient := db.ConnectRedis()
	defer redisClient.Close()

	s := redisClient.SetEx(
		context.Background(),
		"accounts:code:"+base64.URLEncoding.EncodeToString(code),
		id,
		time.Duration(c.Lifespan.AuthorizationCode*time.Second),
	)

	return code, s.Err()
}

// @tags        Auth
// @summary		Initiate the authentication flow
// @description Initiate the authentication flow with the auth service. \
// @description	Any external service should visit this route with a valid redirect
// @description	If the user is already logged in with the auth service, the auth \
// @description	service will redirect the user back to the provided url with a \
// @description	short lived temporary token (1 minute lifespan) - \
// @description that should be used to complete the authentication
// @param		redirect query string true "URL encoded redirect url" example(http://localhost:3001/callback)
// @success     302 "Redirect to the provided URL with temporary code in query param 'code'"
// @failure     400 "Bad Request - invalid redirect URL"
// @failure     500 "Internal Server Error"
// @router      /authorize [GET]
func Authorize(w http.ResponseWriter, r *http.Request) {
	redirect := r.URL.Query().Get("redirect")
	redirect_uri, err := url.ParseRequestURI(redirect)
	if err != nil {
		helpers.Response(w, http.StatusBadRequest, err.Error())
		return
	}
	refreshToken, err := r.Cookie("refreshToken")
	if err != nil {
		http.Redirect(w, r, "/login?redirect="+r.URL.String(), http.StatusTemporaryRedirect)
		return
	}
	claims, err := helpers.GetClaimsFromToken(refreshToken.Value)
	if err != nil {
		log.Println(err.Error())
		helpers.Response(w, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		return
	}

	code, err := createAndStoreCode(claims["id"].(string))

	if err != nil {
		helpers.Response(w, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		return
	}
	query := redirect_uri.Query()

	query.Add("code", base64.URLEncoding.EncodeToString(code))
	redirect_uri.RawQuery = query.Encode()
	http.Redirect(w, r, redirect_uri.String(), http.StatusTemporaryRedirect)
}

// @tags        Auth
// @summary		Get tokens from code
// @description This is the second step of the authorization flow \
// @description Check GET /api/authorize for more information about the first step of this flow.
// @description The client should invoke this endpoint with the code received from the previous step.
// @description The client shall receive a pair of access token (found in response body) \
// @description and refresh token (found in cookie: refreshToken) after completing all the steps.
// @description Client can act on behalf of the user after receiving the token pair
// @accept      json
// @produce     json
// @param		code query string true "URL encoded code received from previous step" example(abcdefgh)
// @success 200 {object} helpers.SuccessResponseModel{data=object{token=string}} "Access token returned in response body; refresh token is set in cookie 'refreshToken'"
// @failure 	401 "If token is invalid or expired"
// @failure 	404 "Token is related to a non-existing user"
// @failure     500 "Internal Server error"
// @router      /token [POST]
func GetToken(w http.ResponseWriter, r *http.Request) {
	c := config.GetConfig()
	code := r.URL.Query().Get("code")
	redisClient := db.ConnectRedis()
	res := redisClient.Get(context.Background(), "accounts:code:"+code)
	if res.Err() != nil {
		if res.Err() == redis.Nil {
			helpers.Response(w, http.StatusUnauthorized, http.StatusText(http.StatusUnauthorized))
			return
		}
		log.Println(res.Err())
		helpers.Response(w, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		return
	}
	id := uuid.FromStringOrNil(res.Val())
	if id == uuid.Nil {
		// this should never happen
		helpers.Response(w, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		return
	}
	u, err := models.UserModel{}.GetUserByID(id)
	if err != nil {
		if ve, ok := err.(apiErrors.NotFoundError); ok {
			helpers.Response(w, http.StatusNotFound, ve.Error())
			return
		}
		log.Println(err)
		helpers.Response(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	accessToken, refreshToken, err := helpers.GenerateTokens(id.String(), u.Name, u.Email, u.Roles)
	if err != nil {
		log.Println(err.Error())
		helpers.Response(w, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     "refreshToken",
		Value:    refreshToken,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Now().Add(c.Lifespan.RefreshToken + time.Second),
	})
	helpers.Response(w, http.StatusOK, map[string]string{"token": accessToken})
}

type LoginRequestBody struct {
	Email    string `json:"email" example:"infosliitmcc@gmail.com"`
	Password string `json:"password" example:"password"`
}

// @tags        Auth
// @summary     Login user
// @description Endpoint to log in a user with email and password
// @description Upon successful login user receives a pair of access token (found in response body) \
// @description and refresh token (found in cookie: refreshToken)
// @accept      json
// @produce     json
// @param       request body object true "Request body"
// @success 	200 {object} helpers.SuccessResponseModel{data=object{token=string}} "Access token returned in response body; refresh token is set in cookie 'refreshToken'"
// @failure     400 "Invalid or empty body"
// @failure     400 "email and password cannot be empty"
// @failure     401 "Invalid credentials"
// @failure     500 "Internal Server error"
// @router      /login [POST]
func Login(w http.ResponseWriter, r *http.Request) {
	c := config.GetConfig()
	defer r.Body.Close()
	var requestBody LoginRequestBody

	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		helpers.Response(w, http.StatusBadRequest, "Invalid or empty body")
		return
	}
	if requestBody.Email == "" || requestBody.Password == "" {
		helpers.Response(w, http.StatusBadRequest, "email and password cannot be empty")
		return
	}

	accessToken, refreshToken, err := models.UserModel{}.Login(requestBody.Email, requestBody.Password)
	if err != nil {
		if _, ok := err.(apiErrors.NotFoundError); ok {
			helpers.Response(w, http.StatusUnauthorized, "Invalid credentials")
			return
		}
		log.Println(err.Error())
		helpers.Response(w, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		return
	}
	if accessToken == "" || refreshToken == "" {
		helpers.Response(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "refreshToken",
		Value:    refreshToken,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Now().Add(c.Lifespan.RefreshToken * time.Second),
	})
	helpers.Response(w, http.StatusOK, map[string]string{"token": accessToken})
}

// @tags        Auth
// @summary     Logout user
// @description Logout user. Clears the refreshToken cookie
// @accept      json
// @produce     json
// @success     200 {object} helpers.SuccessResponseModel "Logout successful"
// @failure     500 "Internal Server Error"
// @router      /logout [POST]
func Logout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "refreshToken",
		Value:    "",
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})
	helpers.Response(w, http.StatusOK, http.StatusText(http.StatusOK))
}

func getAccessTokenFromRefresh(refreshToken string) (string, error) {
	godotenv.Load()
	jwtSecret := os.Getenv("JWT_SECRET")
	tokenString := refreshToken
	claims := jwt.MapClaims{}
	if _, err := jwt.ParseWithClaims(tokenString, claims, func(*jwt.Token) (interface{}, error) {
		return []byte(jwtSecret), nil
	}); err != nil {
		return "", err
	}
	id := uuid.FromStringOrNil(claims["id"].(string))
	if id == uuid.Nil {
		return "", errors.New("invalid token")
	}

	u, err := models.UserModel{}.GetUserByID(id)
	if err != nil {
		return "", err
	}

	accessToken, _, err := helpers.GenerateTokens(u.ID.String(), u.Name, u.Email, u.Roles)
	return accessToken, err
}

// @tags        Auth
// @summary     Refresh acess token
// @description Refresh the access token with the refresh token
// @accept      json
// @produce     json
// @success 	200 {object} helpers.SuccessResponseModel{data=object{token=string}} "Access token"
// @failure		401 "Invalid or missing refresh token"
// @failure     500 "Internal Server Error"
// @router      /token/refresh [POST]
func RefreshToken(w http.ResponseWriter, r *http.Request) {
	// todo: right now you can probably pass an access token and this endpoint would still work
	token, err := r.Cookie("refreshToken")
	if err != nil {
		if err == http.ErrNoCookie {
			helpers.Response(w, http.StatusUnauthorized, http.StatusText(http.StatusUnauthorized))
			return
		}
		log.Println(err.Error())
		helpers.Response(w, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		return
	}

	accessToken, err := getAccessTokenFromRefresh(token.Value)
	if err != nil {
		if err.Error() == "invalid token" {
			helpers.Response(w, http.StatusUnauthorized, err.Error())
			return
		} else if _, ok := err.(apiErrors.NotFoundError); ok {
			helpers.Response(w, http.StatusUnauthorized, http.StatusText(http.StatusUnauthorized))
			return
		}
		helpers.Response(w, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		return
	}
	helpers.Response(w, http.StatusOK, map[string]string{"token": accessToken})
}
