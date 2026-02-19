package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/sliitmozilla/accounts/db/models"
	errors "github.com/sliitmozilla/accounts/errors"
	"github.com/sliitmozilla/accounts/helpers"
)

// @tags        Roles
// @summary		Get all roles
// @description Get all roles. Protected route
// @security	AccessToken
// @accept      json
// @produce     json
// @success		200 object helpers.SuccessResponseModel{data=[]string} "Role list"
// @failure		401 "Not logged in or invalid token"
// @failure		403 "Forbidden (admin only route)"
// @failure     500 "Internal Server Error"
// @router      /roles [GET]
func GetRoles(w http.ResponseWriter, r *http.Request) {
	roles, err := models.RoleModel{}.SelectAll()
	if err != nil {
		log.Println(err.Error())
		return
	}
	helpers.Response(w, http.StatusOK, roles)
}

type CreateRoleBody struct {
	Name string `json:"name" validate:"required,min=2,max=20"`
}

// @tags        Roles
// @summary		Create a new role
// @description Create a new role. Protected route
// @security	AccessToken
// @accept      json
// @produce     json
// @param       request body models.RoleModel true "Request body"
// @success		201 "Created"
// @failure		400 "Invalid request body"
// @failure		401 "Not logged in or invalid token"
// @failure		403 "Attempting to create admin role"
// @failure		403 "Forbidden (admin only route)"
// @failure		409 "Duplicate role"
// @failure     500 "Internal Server Error"
// @router      /roles [POST]
func CreateRole(w http.ResponseWriter, r *http.Request) {
	var role models.RoleModel
	var createRoleBody CreateRoleBody
	if err := json.NewDecoder(r.Body).Decode(&createRoleBody); err != nil {
		helpers.Response(w, http.StatusBadRequest, "Invalid or empty body")
		return
	}
	if role.Name == "admin" {
		helpers.Response(w, http.StatusForbidden, http.StatusText(http.StatusForbidden))
		return
	}
	if errs := helpers.Validate(createRoleBody); errs != nil {
		helpers.Response(w, http.StatusBadRequest, errs)
		return
	}

	role = models.RoleModel{Name: createRoleBody.Name}
	if _, err := role.Insert(); err != nil {
		if ve, ok := err.(errors.DuplicateError); ok {
			helpers.Response(w, http.StatusConflict, ve.Error())
			return
		}
		log.Println(err.Error())
		helpers.Response(w, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		return
	}

	helpers.Response(w, http.StatusCreated, http.StatusText(http.StatusCreated))
}

type UpdateRoleBody struct {
	Name string `json:"name" validate:"required,min=2,max=20"`
}

// @tags        Roles
// @summary		Update a role
// @description Update a role. Protected route
// @security	AccessToken
// @accept      json
// @produce     json
// @param		role path string true "Role name"
// @success		200 "OK"
// @failure		400 "Invalid request body"
// @failure 	400 "Name cannot be empty"
// @failure		401 "Not logged in or invalid token"
// @failure		403 "Forbidden (admin only route)"
// @failure		403 "Attempt to modify admin role"
// @failure		404 "Role not found"
// @failure     500 "Internal Server Error"
// @router      /roles/{role} [PATCH]
func UpdateRole(w http.ResponseWriter, r *http.Request) {
	role := r.PathValue("role")
	originalRole := models.RoleModel{Name: role}
	var newRole UpdateRoleBody

	if role == "admin" {
		helpers.Response(w, http.StatusForbidden, http.StatusText(http.StatusForbidden))
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&newRole); err != nil {
		helpers.Response(w, http.StatusBadRequest, "Invalid or empty body")
		return
	}
	if newRole.Name == "admin" {
		helpers.Response(w, http.StatusForbidden, http.StatusText(http.StatusForbidden))
		return
	}
	if errs := helpers.Validate(newRole); errs != nil {
		helpers.Response(w, http.StatusBadRequest, errs)
		return
	}

	rows, err := originalRole.Update(models.RoleModel{Name: newRole.Name})
	if err != nil {
		log.Println(err.Error())
		helpers.Response(w, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		return
	}
	if rows == 0 {
		helpers.Response(w, http.StatusNotFound, "Role not found")
		return
	}
	helpers.Response(w, http.StatusOK, http.StatusText(http.StatusOK))
}

// @tags        Roles
// @summary		Delete a role
// @description Delete a role. Protected route
// @security	AccessToken
// @accept      json
// @produce     json
// @param		role path string true "Role name"
// @success		200 "OK"
// @failure		401 "Not logged in or invalid token"
// @failure		403 "Forbidden (admin only route)"
// @failure		403 "Attempt to delete admin role"
// @failure		404 "Role not found"
// @failure     500 "Internal Server Error"
// @router      /roles/{role} [DELETE]
func DeleteRole(w http.ResponseWriter, r *http.Request) {
	role := models.RoleModel{Name: r.PathValue("role")}
	if role.Name == "admin" {
		helpers.Response(w, http.StatusForbidden, http.StatusText(http.StatusForbidden))
		return
	}
	rows, err := role.Delete()
	if err != nil {
		log.Println(err.Error())
		helpers.Response(w, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		return
	}
	if rows == 0 {
		helpers.Response(w, http.StatusNotFound, "Role not found")
		return
	}
	helpers.Response(w, http.StatusOK, http.StatusText(http.StatusOK))
}
