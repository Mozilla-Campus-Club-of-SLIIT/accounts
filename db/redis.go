package db

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
)

func ConnectRedis() *redis.Client {
	godotenv.Load()
	opt, err := redis.ParseURL(os.Getenv("REDIS_URL"))
	if err != nil {
		log.Fatal(err)
	}

	client := redis.NewClient(opt)

	return client
}
