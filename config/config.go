// credits: rxOred (https://github.com/byte3org/bookclub-backend/blob/main/config/config.go)

package config

import (
	_ "embed"
	"encoding/json"
	"log"
	"time"
)

type Lifespan struct {
	AccessToken       time.Duration `json:"accessToken"`
	RefreshToken      time.Duration `json:"refreshToken"`
	AuthorizationCode time.Duration `json:"authorizationCode"`
}

type Config struct {
	Environment string   `json:"env"`
	Host        string   `json:"host"`
	Port        string   `json:"port"`
	Lifespan    Lifespan `json:"lifespan"`
}

var config *Config

//go:embed config.json
var configData []byte

func init() {

	conf := Config{}
	if err := json.Unmarshal(configData, &conf); err != nil {
		log.Fatal("[x] error : ", err.Error())
	}
	config = &conf
}

func GetConfig() *Config {
	return config
}
