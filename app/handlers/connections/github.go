package connections

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/joho/godotenv"
	"github.com/pkg/errors"
	"github.com/sliitmozilla/accounts/app/middlewares"
	"github.com/sliitmozilla/accounts/db/models"
	apiErrors "github.com/sliitmozilla/accounts/errors"
	"github.com/sliitmozilla/accounts/helpers"
)

// @tags        Connections
// @summary		Initiates the request to link an account with Github
// @description Initiates the request to link an account with Github
// @description If the user is logged in, redirect to Github OAuth authorization endpoint \
// @description to initiate the Github browser authorization flow
// @description See more: [Github OAuth documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
// @security 	AccessToken
// @accept      json
// @produce     json
// @success     302 "Redirect to Github OAuth authorization endpoint"
// @failure     401 "Not logged in or invalid token"
// @failure     500 "Internal Server Error"
// @router      /connections/github/link [POST]
func LinkGithub(w http.ResponseWriter, r *http.Request) {
	godotenv.Load()

	clientId := os.Getenv("GITHUB_CLIENT_ID")
	ctxUser := r.Context().Value(middlewares.UserContext{}).(*models.UserModel)
	helpers.Response(w, http.StatusOK, fmt.Sprintf(
		"https://github.com/login/oauth/authorize?client_id=%s&state=%s",
		clientId, ctxUser.ID.String(),
	))
}

type GithubCallbackBody struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	Scope       string `json:"scope"`
}

type GithubUser struct {
	Login string `json:"login"`
	Id    int    `json:"id"`
	Email string `json:"email"`
}

func getGithubUser(accessToken string) (*GithubUser, error) {
	req, _ := http.NewRequest(http.MethodGet, "https://api.github.com/user", nil)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != 200 {
		return nil, errors.New(http.StatusText(http.StatusInternalServerError))
	}
	defer resp.Body.Close()

	user := GithubUser{}
	json.NewDecoder(resp.Body).Decode(&user)
	return &user, nil
}

func getGhAccessToken(w http.ResponseWriter, r *http.Request) string {
	godotenv.Load()

	clientId := os.Getenv("GITHUB_CLIENT_ID")
	clientSecret := os.Getenv("GITHUB_CLIENT_SECRET")
	code := r.URL.Query().Get("code")

	req, _ := http.NewRequest(
		http.MethodPost,
		fmt.Sprintf(
			"https://github.com/login/oauth/access_token?client_id=%s&client_secret=%s&code=%s",
			clientId, clientSecret, code,
		),
		nil,
	)

	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)

	if err != nil {
		log.Println(err.Error())
		helpers.Response(w, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		return ""
	}

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		var data map[string]interface{}
		_ = json.Unmarshal(body, &data)
		helpers.Response(w, resp.StatusCode, data)
		return ""
	}
	defer resp.Body.Close()

	body := GithubCallbackBody{}
	json.NewDecoder(resp.Body).Decode(&body)

	return body.AccessToken
}

// @tags        Connections
// @summary		Handles the OAuth authorization callback sent from Github
// @description Handles the OAuth authorization callback sent from Github
// @description This endpoint is not meant to be invoked directly, but from Github once authorized from their platform
// @description See more: [Github OAuth documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
// @security 	AccessToken
// @accept      json
// @produce     json
// @param 		state query string true "([Github OAuth documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps))"
// @param		code query string true "Set by Github OAuth. ([Github OAuth documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps))"
// @success     302 "Redirect to profile after successful linking"
// @failure     404 "User or provider invalid (not found)"
// @failure 	409 "Already linked"
// @failure     500 "Internal Server Error"
// @router      /connections/github/callback [POST]
func CallbackGithub(w http.ResponseWriter, r *http.Request) {
	state := r.URL.Query().Get("state")

	ghAccessToken := getGhAccessToken(w, r)
	if ghAccessToken == "" {
		return
	}

	user, err := getGithubUser(ghAccessToken)
	if err != nil {
		helpers.Response(w, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		return
	}

	connection := models.ConnectionModel{
		UserId:               state,
		Provider:             "github",
		ProviderUserId:       strconv.Itoa(user.Id),
		ProviderUserName:     user.Login,
		ProviderAccountEmail: user.Email,
	}

	if _, err := connection.Insert(); err != nil {
		if ve, ok := err.(apiErrors.NotFoundError); ok {
			helpers.Response(w, http.StatusNotFound, ve.Error())
			return
		} else if ve, ok := err.(apiErrors.DuplicateError); ok {
			helpers.Response(w, http.StatusConflict, ve.Error())
			return
		}
		log.Println(err.Error())
		helpers.Response(w, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		return
	}

	http.Redirect(w, r, "/profile", http.StatusTemporaryRedirect)
}

// @tags        Connections
// @summary		Unlink Github account from a user
// @description Unlink Github account from a user
// @security	AccessToken
// @accept      json
// @produce     json
// @success		200 "OK"
// @failure		401 "Not logged in or invalid token"
// @failure 	404 "User or provider not found"
// @failure     500 "Internal Server Error"
// @router      /connections/github/ [DELETE]
func UnlinkGithub(w http.ResponseWriter, r *http.Request) {
	ctxUser := r.Context().Value(middlewares.UserContext{}).(*models.UserModel)
	c := models.ConnectionModel{UserId: ctxUser.ID.String()}
	rows, err := c.Delete()
	if rows == 0 {
		helpers.Response(w, http.StatusNotFound, "User or provider not found")
		return
	}
	if err != nil {
		helpers.Response(w, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		return
	}
	helpers.Response(w, http.StatusOK, http.StatusText(http.StatusOK))
}
