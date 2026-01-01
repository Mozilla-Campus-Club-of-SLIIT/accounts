package helpers

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) string {
	hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(hash)
}

func ValidatePassword(hashedPassword, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}

func GenerateTokens(id, name, email string, roles []string) (accessToken, refreshToken string, err error) {
	godotenv.Load()
	jwtSecret := os.Getenv("JWT_SECRET")

	access := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":    id,
		"name":  name,
		"email": email,
		"roles": roles,
		"exp":   time.Now().Add(15 * time.Minute).Unix(),
		"iat":   time.Now().Unix(),
	})
	accessToken, err = access.SignedString([]byte(jwtSecret))
	if err != nil {
		return
	}

	refresh := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":  id,
		"exp": time.Now().Add(30 * 24 * time.Hour).Unix(),
		"iat": time.Now().Unix(),
	})
	refreshToken, err = refresh.SignedString([]byte(jwtSecret))
	return
}

func GetClaimsFromToken(token string) (jwt.MapClaims, error) {
	godotenv.Load()
	jwtSecret := os.Getenv("JWT_SECRET")
	claims := jwt.MapClaims{}
	if _, err := jwt.ParseWithClaims(token, claims, func(*jwt.Token) (interface{}, error) {
		return []byte(jwtSecret), nil
	}); err != nil {
		return nil, err
	}
	return claims, nil
}
