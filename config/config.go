// credits: rxOred (https://github.com/byte3org/bookclub-backend/blob/main/config/config.go)

package config

import (
	"encoding/json"
	"log"
	"os"
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

func init() {
	file, err := os.Open("config/config.json")
	if err != nil {
		log.Fatal("[x] error : ", err.Error())
	}
	decoder := json.NewDecoder(file)
	conf := Config{}
	err = decoder.Decode(&conf)
	if err != nil {
		log.Fatal("[x] error : ", err.Error())
	}
	config = &conf
}

func GetConfig() *Config {
	return config
}
