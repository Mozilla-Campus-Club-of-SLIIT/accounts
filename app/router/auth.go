package router

import (
	"github.com/go-chi/chi/v5"

	authHandlers "github.com/sliitmozilla/accounts/app/handlers"
	"github.com/sliitmozilla/accounts/app/middlewares"
)

type AuthRoutes struct{}

func (b AuthRoutes) Routes() chi.Router {

	r := chi.NewRouter()

	r.Route("/", func(authRoutes chi.Router) {
		authRoutes.Get("/authorize", authHandlers.Authorize)
		authRoutes.With(middlewares.AuthHandler).With(middlewares.RequireLogin).Get("/session", authHandlers.GetSession)
		authRoutes.Post("/login", authHandlers.Login)
		authRoutes.Post("/logout", authHandlers.Logout)
		authRoutes.Route("/token", func(authTokenRoutes chi.Router) {
			authTokenRoutes.Post("/", authHandlers.GetToken)
			authTokenRoutes.Post("/refresh", authHandlers.RefreshToken)
		})
	})

	return r
}
