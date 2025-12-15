package router

import (
	"github.com/go-chi/chi/v5"

	roleHandlers "github.com/sliitmozilla/accounts/app/handlers"
	"github.com/sliitmozilla/accounts/app/middlewares"
)

type RolesRoutes struct{}

func (b RolesRoutes) Routes() chi.Router {

	r := chi.NewRouter()
	r.Use(middlewares.AuthHandler)
	r.Use(middlewares.RequireLogin)
	r.Use(middlewares.RequireRoles("admin"))

	r.Route("/", func(rolesRoutes chi.Router) {
		rolesRoutes.Get("/", roleHandlers.GetRoles)
		rolesRoutes.Post("/", roleHandlers.CreateRole)
	})

	r.Route("/{role}", func(rolesRoutes chi.Router) {
		rolesRoutes.Patch("/", roleHandlers.UpdateRole)
		rolesRoutes.Delete("/", roleHandlers.DeleteRole)
	})

	return r
}
