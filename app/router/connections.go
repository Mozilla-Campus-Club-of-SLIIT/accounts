package router

import (
	"github.com/go-chi/chi/v5"

	connectionHandler "github.com/sliitmozilla/accounts/app/handlers/connections"
	"github.com/sliitmozilla/accounts/app/middlewares"
)

type ConnectionsRoute struct{}

func (b ConnectionsRoute) Routes() chi.Router {

	r := chi.NewRouter()
	r.Use(middlewares.AuthHandler)

	r.Route("/github", func(githubRoutes chi.Router) {
		githubRoutes.With(middlewares.RequireLogin).Post("/link", connectionHandler.LinkGithub)
		githubRoutes.Get("/callback", connectionHandler.CallbackGithub)
	})

	return r
}
