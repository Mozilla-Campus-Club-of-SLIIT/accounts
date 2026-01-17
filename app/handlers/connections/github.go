package connections

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/joho/godotenv"
	"github.com/pkg/errors"
	"github.com/sliitmozilla/accounts/app/middlewares"
	"github.com/sliitmozilla/accounts/db/models"
	"github.com/sliitmozilla/accounts/helpers"
)

func LinkGithub(w http.ResponseWriter, r *http.Request) {
	godotenv.Load()

	clientId := os.Getenv("GITHUB_CLIENT_ID")
	ctxUser := r.Context().Value(middlewares.UserContext{}).(*models.UserModel)
	helpers.Response(w, http.StatusOK, fmt.Sprintf(
		"https://github.com/login/oauth/authorize?client_id=%s&state=%s",
		clientId, ctxUser.ID.String(),
	))
}

type GithubCallbackBody struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	Scope       string `json:"scope"`
}

type GithubUser struct {
	Login string `json:"login"`
	Id    int    `json:"id"`
	Email string `json:"email"`
}

func getGithubUser(accessToken string) (*GithubUser, error) {
	req, _ := http.NewRequest(http.MethodGet, "https://api.github.com/user", nil)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != 200 {
		return nil, errors.New(http.StatusText(http.StatusInternalServerError))
	}
	defer resp.Body.Close()

	user := GithubUser{}
	json.NewDecoder(resp.Body).Decode(&user)
	return &user, nil
}

func getGhAccessToken(w http.ResponseWriter, r *http.Request) string {
	godotenv.Load()

	clientId := os.Getenv("GITHUB_CLIENT_ID")
	clientSecret := os.Getenv("GITHUB_CLIENT_SECRET")
	code := r.URL.Query().Get("code")

	req, _ := http.NewRequest(
		http.MethodPost,
		fmt.Sprintf(
			"https://github.com/login/oauth/access_token?client_id=%s&client_secret=%s&code=%s",
			clientId, clientSecret, code,
		),
		nil,
	)

	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)

	if err != nil {
		log.Println(err.Error())
		helpers.Response(w, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		return ""
	}

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		var data map[string]interface{}
		_ = json.Unmarshal(body, &data)
		helpers.Response(w, resp.StatusCode, data)
		return ""
	}
	defer resp.Body.Close()

	body := GithubCallbackBody{}
	json.NewDecoder(resp.Body).Decode(&body)

	return body.AccessToken
}

func CallbackGithub(w http.ResponseWriter, r *http.Request) {
	state := r.URL.Query().Get("state")

	ghAccessToken := getGhAccessToken(w, r)
	if ghAccessToken == "" {
		return
	}

	user, err := getGithubUser(ghAccessToken)
	if err != nil {
		helpers.Response(w, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		return
	}

	connection := models.ConnectionModel{
		UserId:               state,
		Provider:             "github",
		ProviderUserId:       strconv.Itoa(user.Id),
		ProviderUserName:     user.Login,
		ProviderAccountEmail: user.Email,
	}

	if _, err := connection.Insert(); err != nil {
		log.Println(err.Error())
		helpers.Response(w, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		return
	}

	http.Redirect(w, r, "/profile", http.StatusTemporaryRedirect)
}
