package middlewares

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gofrs/uuid"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"github.com/sliitmozilla/accounts/db/models"
	"github.com/sliitmozilla/accounts/helpers"
)

type UserContext struct{}

func parseTokenAndGetUser(token string) (u *models.UserModel, err error) {
	godotenv.Load()
	jwtSecret := os.Getenv("JWT_SECRET")
	claims := jwt.MapClaims{}
	if _, err = jwt.ParseWithClaims(token, claims, func(*jwt.Token) (interface{}, error) {
		return []byte(jwtSecret), nil
	}); err != nil {
		return nil, err
	}
	id := uuid.FromStringOrNil(claims["id"].(string))
	name, nameOk := claims["name"].(string)
	email, emailOk := claims["email"].(string)

	// https://stackoverflow.com/questions/57032662/how-to-check-roles-claim-array-of-values-of-a-jwt-for-a-certain-value
	r := claims["roles"].([]any)
	roles := make([]string, len(r))
	for i, role := range r {
		roles[i] = role.(string)
	}

	if id == uuid.Nil || !nameOk || !emailOk || name == "" || email == "" {
		return nil, errors.New("invalid token")
	}
	u = &models.UserModel{ID: id, Name: name, Email: email, Roles: roles}
	return
}

func AuthHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			next.ServeHTTP(w, r)
			return
		}
		split := strings.Split(authHeader, " ")
		if len(split) != 2 {
			helpers.Response(w, http.StatusUnauthorized, "Invalid token")
			return
		}

		token := split[1]
		var u *models.UserModel
		var err error
		if u, err = parseTokenAndGetUser(token); err != nil {
			log.Println(err.Error())
			helpers.Response(w, http.StatusUnauthorized, "Invalid token")
			return
		}

		ctx := context.WithValue(r.Context(), UserContext{}, u)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func RequireLogin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctxUser := r.Context().Value(UserContext{})
		if ctxUser == nil {
			helpers.Response(w, http.StatusUnauthorized, http.StatusText(http.StatusUnauthorized))
			return
		}
		next.ServeHTTP(w, r)
	})
}
