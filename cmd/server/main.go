package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/go-chi/chi/v5"
	"github.com/sliitmozilla/accounts/app/router"
	"github.com/sliitmozilla/accounts/config"
)

func main() {
	c := config.GetConfig()
	r := chi.NewRouter()
	dir, _ := os.Getwd()

	r.Mount("/api", router.SetupRoutes())

	frontendDir := filepath.Join(dir, "frontend", "dist")
	r.Get("/*", func(w http.ResponseWriter, req *http.Request) {
		path := filepath.Join(frontendDir, req.URL.Path)
		if stat, err := os.Stat(path); os.IsNotExist(err) || stat.IsDir() {
			path = filepath.Join(frontendDir, "index.html")
		}
		http.ServeFile(w, req, path)
	})
	err := http.ListenAndServe(c.Host+":"+c.Port, r)
	if err != nil {
		log.Println(err.Error())
	}
}
