package middlewares

import (
	"context"
	"errors"
	"log"
	"net/http"
	"strings"

	"github.com/gofrs/uuid"
	"github.com/sliitmozilla/accounts/db/models"
	"github.com/sliitmozilla/accounts/helpers"
)

type UserContext struct{}

func parseTokenAndGetUser(token string) (u *models.UserModel, err error) {
	claims, err := helpers.GetClaimsFromToken(token)
	if err != nil {
		return nil, err
	}
	id := uuid.FromStringOrNil(claims["id"].(string))
	name, nameOk := claims["name"].(string)
	email, emailOk := claims["email"].(string)

	rawRoles, ok := claims["roles"].([]any)
	if !ok {
		return nil, errors.New("invalid token")
	}
	roles := make([]string, len(rawRoles))
	for i, role := range rawRoles {
		roleStr, ok := role.(string)
		if !ok {
			return nil, errors.New("invalid token")
		}
		roles[i] = roleStr
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
