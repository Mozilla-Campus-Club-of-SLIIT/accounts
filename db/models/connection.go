package models

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/sliitmozilla/accounts/db"
	apiErrors "github.com/sliitmozilla/accounts/errors"
)

type ConnectionModel struct {
	UserId               string    `json:"-"`
	Provider             string    `json:"provider" example:"github"`
	ProviderUserId       string    `json:"providerUserId" example:"1"`
	ProviderUserName     string    `json:"providerUserName" example:"sliitmozillian"`
	ProviderAccountEmail string    `json:"providerAccountEmail" example:"infosliitmcc@gmail.com"`
	LinkedAt             time.Time `json:"linkedAt" example:"2025-12-31T00:00:00Z"`
}

func (c *ConnectionModel) Insert() (int, error) {
	conn, err := db.ConnectDB()
	if err != nil {
		return 0, err
	}
	defer conn.Close(context.Background())

	t, err := conn.Exec(
		context.Background(),
		`INSERT INTO UserConnections (userId, provider, providerUserId, providerAccountEmail, providerUserName)
		VALUES ($1, $2, $3, $4, $5)`,
		c.UserId, c.Provider, c.ProviderUserId, c.ProviderAccountEmail, c.ProviderUserName,
	)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			switch pgErr.Code {
			case "23505":
				return 0, apiErrors.DuplicateError{Msg: "Already linked"}
			case "23503":
				return 0, apiErrors.NotFoundError{Msg: "User or provider invalid"}
			}
		}
		return 0, err
	}

	return int(t.RowsAffected()), nil
}
