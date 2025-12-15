package router

import (
	"github.com/go-chi/chi/v5"

	usersHandler "github.com/sliitmozilla/accounts/app/handlers"
	"github.com/sliitmozilla/accounts/app/middlewares"
)

type UsersRoute struct{}

func (b UsersRoute) Routes() chi.Router {

	r := chi.NewRouter()

	r.Use(middlewares.AuthHandler)

	r.Route("/", func(usersRoutes chi.Router) {
		usersRoutes.With(middlewares.RequireRoles("admin")).Get("/", usersHandler.GetUsers)
		usersRoutes.Post("/", usersHandler.CreateUser)
	})

	r.Route("/me", func(usersRoute chi.Router) {
		usersRoute.Use(middlewares.RequireLogin)
		usersRoute.Get("/", usersHandler.GetMe)
		usersRoute.Patch("/", usersHandler.UpdateMe)
		usersRoute.Patch("/password", usersHandler.ChangePassword)
	})

	r.Route("/{id}", func(usersRoute chi.Router) {
		usersRoute.Get("/", usersHandler.GetUser)
		usersRoute.Patch("/", usersHandler.UpdateUser)
		usersRoute.Route("/roles", func(usersRolesRoute chi.Router) {
			usersRolesRoute.Use(middlewares.RequireLogin)
			usersRolesRoute.Use(middlewares.RequireRoles("admin"))
			usersRolesRoute.Post("/", usersHandler.AddRole)
			usersRolesRoute.Delete("/{role}", usersHandler.RemoveRole)
		})
	})

	return r
}
