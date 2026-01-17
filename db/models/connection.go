package models

import (
	"context"
	"time"

	"github.com/sliitmozilla/accounts/db"
)

type ConnectionModel struct {
	UserId               string    `json:"-"`
	Provider             string    `json:"provider"`
	ProviderUserId       string    `json:"providerUserId"`
	ProviderUserName     string    `json:"providerUserName"`
	ProviderAccountEmail string    `json:"providerAccountEmail"`
	LinkedAt             time.Time `json:"linkedAt"`
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
		return 0, err
	}

	return int(t.RowsAffected()), nil
}
