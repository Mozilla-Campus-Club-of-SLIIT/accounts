package db

import (
	"context"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/joho/godotenv"
)

var Conn *pgx.Conn

func ConnectDB() (*pgx.Conn, error) {
	godotenv.Load()
	dbUrl := os.Getenv("DB_URL")

	var err error
	Conn, err = pgx.Connect(context.Background(), dbUrl)
	if err != nil {
		return nil, err
	}

	return Conn, nil
}
