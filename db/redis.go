package db

import (
	"os"

	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
)

func ConnectRedis() *redis.Client {
	godotenv.Load()
	client := redis.NewClient(&redis.Options{Addr: os.Getenv("REDIS_URL")})
	return client
}
