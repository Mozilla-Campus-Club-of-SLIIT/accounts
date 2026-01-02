package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/sliitmozilla/accounts/app/router"
)

// @title					 sliitmozilla Auth Service
// @description	 API documentation for the authentication service used across all SLIITMozilla.
// @description	 We use `helpers.SuccessResponseModel` for successful responses and `helpers.FailureResponseModel` for errors.
// @description	 Example success response:
// @description	 ```json
// @description	 { "data": ... }
// @description	 ```
// @description	 Example failure response:
// @description	 ```json
// @description	 { "error": { "code": 500, "message": ... }}
// @description	 ```
// @version					 1.0
// @schemes					 https http
// @host					 accounts.sliitmozilla.org
// @basePath				 /api
// @contact.name			 Mozilla Campus Club of SLIIT
// @contact.url 			 https://www.sliitmozilla.org/contact/
// @contact.email 			 infosliitmcc@gmail.com
// @license.name 			 MPL-2.0
// @license.url 			 https://github.com/Mozilla-Campus-Club-of-SLIIT/accounts/blob/main/LICENSE
// @accept 					 json
// @produce 				 json
// @securityDefinitions.apiKey AccessToken
// @scheme 					 bearer
// @bearerFormat 			 JWT
// @in header
// @name Authorization
func Handler(w http.ResponseWriter, req *http.Request) {
	r := chi.NewRouter()
	r.Mount("/api", router.SetupRoutes())
	r.ServeHTTP(w, req)
}
