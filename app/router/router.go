package router

import (
	"net/http"
	"os"
	"path/filepath"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	httpSwagger "github.com/swaggo/http-swagger"

	"github.com/sliitmozilla/accounts/app/middlewares"
	_ "github.com/sliitmozilla/accounts/docs"
)

func SetupRoutes() *chi.Mux {
	r := chi.NewRouter()
	dir, _ := os.Getwd()

	r.Use(middlewares.Cors)
	r.Use(middleware.Logger)
	r.Use(middleware.AllowContentType("application/json"))

	r.Mount("/", AuthRoutes{}.Routes())
	r.Mount("/users", UsersRoute{}.Routes())
	r.Mount("/roles", RolesRoutes{}.Routes())
	r.Mount("/connections", ConnectionsRoute{}.Routes())

	// Swagger docs
	fs := http.FileServer(http.Dir(filepath.Join(dir, "docs")))
	r.Handle("/docs/swagger.json", http.StripPrefix("/api/docs", fs))
	r.Get("/docs/*", httpSwagger.Handler(
		httpSwagger.URL("/api/docs/swagger.json"),
	))

	return r
}
