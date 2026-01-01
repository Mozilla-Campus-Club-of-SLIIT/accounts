package helpers

import (
	"encoding/json"
	"net/http"
)

type ErrorResponseModel struct {
	Code    int    `json:"code" example:"500"`
	Message string `json:"message" example:"Internal server error"`
}

type SuccessResponseModel struct {
	Data any `json:"data"`
}

type FailureResponseModel struct {
	Error ErrorResponseModel `json:"error"`
}

func Response(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	if status >= 200 && status < 300 {
		_ = json.NewEncoder(w).Encode(SuccessResponseModel{
			Data: data,
		})
		return
	}

	_ = json.NewEncoder(w).Encode(FailureResponseModel{
		Error: ErrorResponseModel{
			Code:    status,
			Message: data.(string),
		},
	})
}
