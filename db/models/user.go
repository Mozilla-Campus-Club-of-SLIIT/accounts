package models

import (
	"context"
	"errors"
	"time"

	"github.com/gofrs/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/sliitmozilla/accounts/db"
	apiErrors "github.com/sliitmozilla/accounts/errors"
	helpers "github.com/sliitmozilla/accounts/helpers"
)

type UserModel struct {
	ID          uuid.UUID         `json:"id"`
	Name        string            `json:"name"`
	Email       string            `json:"email"`
	Password    string            `json:"password" db:"-"`
	Private     bool              `json:"private"`
	CreatedAt   *time.Time        `json:"createdAt"`
	UpdatedAt   *time.Time        `json:"updatedAt"`
	Roles       []string          `json:"roles" db:"-"`
	Connections []ConnectionModel `json:"connections" db:"-"`
}

func (UserModel) Login(email string, password string) (accessToken, refreshToken string, err error) {
	conn, err := db.ConnectDB()
	if err != nil {
		return "", "", err
	}
	defer conn.Close(context.Background())

	rows, err := conn.Query(context.Background(),
		`SELECT u.id, u.name, u.password, array_agg(ur.rolename) AS roles
		FROM users u
		LEFT JOIN userroles ur ON u.id = ur.userid
		WHERE u.email = $1
		GROUP BY u.id`,
		email,
	)
	if err != nil {
		return "", "", err
	}
	if !rows.Next() {
		return "", "", apiErrors.NotFoundError{Msg: "User not found"}
	}

	u := UserModel{Email: email}
	var roles pgtype.Array[pgtype.Text]
	if err := rows.Scan(&u.ID, &u.Name, &u.Password, &roles); err != nil {
		return "", "", err
	}
	// assign roles
	u.Roles = []string{}
	for _, role := range roles.Elements {
		if role.String != "" {
			u.Roles = append(u.Roles, role.String)
		}
	}

	if helpers.ValidatePassword(u.Password, password) {
		accessToken, refreshToken, err = helpers.GenerateTokens(u.ID.String(), u.Name, u.Email, u.Roles)
		return
	}
	return "", "", err
}

func (UserModel) SelectAll() ([]UserModel, error) {
	conn, err := db.ConnectDB()
	if err != nil {
		return nil, err
	}
	defer conn.Close(context.Background())

	rows, err := conn.Query(context.Background(),
		"SELECT id, name, email, createdAt, updatedAt, private FROM users",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return pgx.CollectRows(rows, pgx.RowToStructByName[UserModel])
}

func (UserModel) GetUserByID(id uuid.UUID) (u UserModel, err error) {
	conn, err := db.ConnectDB()
	if err != nil {
		return
	}
	defer conn.Close(context.Background())

	rows, err := conn.Query(context.Background(),
		`SELECT u.id, u.name, u.email, u.createdAt, u.updatedAt, u.private, array_agg(ur.rolename) AS roles
		FROM users u
		LEFT JOIN userroles ur ON u.id = ur.userid
		WHERE id = $1
		GROUP BY u.id`,
		id.String(),
	)
	if err != nil {
		return
	}
	if !rows.Next() {
		err = apiErrors.NotFoundError{Msg: "User not found"}
		return
	}

	u = UserModel{}
	var roles pgtype.Array[pgtype.Text]
	rows.Scan(&u.ID, &u.Name, &u.Email, &u.CreatedAt, &u.UpdatedAt, &u.Private, &roles)
	// assign roles
	u.Roles = []string{}
	for _, role := range roles.Elements {
		if role.String != "" {
			u.Roles = append(u.Roles, role.String)
		}
	}

	return
}

func (u *UserModel) Insert() (int, error) {
	conn, err := db.ConnectDB()
	if err != nil {
		return 0, err
	}
	defer conn.Close(context.Background())

	if u.Name == "" || u.Email == "" || u.Password == "" {
		return 0, apiErrors.ValidationError{Msg: "name, email or password can't be empty"}
	}

	hashedPass := helpers.HashPassword(u.Password)
	t, err := conn.Exec(
		context.Background(),
		"INSERT INTO Users (name, email, password) VALUES ($1, $2, $3)",
		u.Name, u.Email, hashedPass,
	)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			if pgErr.Code == "23505" {
				return 0, apiErrors.DuplicateError{Msg: "Username or email already in use"}
			}
		}
		return 0, err
	}
	return int(t.RowsAffected()), nil
}

func (u *UserModel) InsertRole(role string) (int, error) {
	conn, err := db.ConnectDB()
	if err != nil {
		return 0, err
	}
	defer conn.Close(context.Background())

	t, err := conn.Exec(context.Background(),
		"INSERT INTO userroles VALUES ($1, $2)",
		u.ID, role,
	)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			switch pgErr.Code {
			case "23505":
				return 0, apiErrors.DuplicateError{Msg: "Already assigned"}
			case "23503":
				return 0, apiErrors.NotFoundError{Msg: "User or role not found"}
			}
		}
		return 0, err
	}

	return int(t.RowsAffected()), nil
}

func (u *UserModel) RemoveRole(role string) (int, error) {
	conn, err := db.ConnectDB()
	if err != nil {
		return 0, err
	}
	defer conn.Close(context.Background())

	t, err := conn.Exec(context.Background(),
		"DELETE FROM userroles WHERE userid=$1 AND rolename=$2",
		u.ID.String(), role,
	)
	return int(t.RowsAffected()), err
}
