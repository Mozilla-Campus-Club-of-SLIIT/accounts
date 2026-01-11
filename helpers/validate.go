package helpers

import (
	"errors"
	"fmt"
	"reflect"
	"regexp"
	"strings"

	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate
var reasonMessages map[string]string = map[string]string{
	"required": "%s is required",
	"email":    "%s should be a valid email",
	"min":      "%s should be atleast %s",
	"max":      "%s must be at most %s",
	"password": "%s must have a number, special character, uppercase and lowercase letter",
}

func GetValidator() *validator.Validate {
	if validate == nil {
		validate = validator.New(validator.WithRequiredStructEnabled())
		RegisterPasswordValidation(validate)
	}
	return validate
}

func RegisterPasswordValidation(validate *validator.Validate) {
	validate.RegisterValidation("password", func(fl validator.FieldLevel) bool {
		pass := fl.Field().String()
		numberPattern := regexp.MustCompile(`\d`)
		specialCharPattern := regexp.MustCompile(`[^a-zA-Z0-9]`)
		upperCasePattern := regexp.MustCompile(`[A-Z]`)
		lowerCasePattern := regexp.MustCompile(`[A-Z]`)

		numbers := numberPattern.FindAllString(pass, -1)
		specialChars := specialCharPattern.FindAllString(pass, -1)
		upperCase := upperCasePattern.FindAllString(pass, -1)
		lowerCase := lowerCasePattern.FindAllString(pass, -1)

		return len(numbers) >= 1 && len(specialChars) >= 1 && len(upperCase) >= 1 && len(lowerCase) >= 1
	})
}

func getErrorMessage(field string, err validator.FieldError) string {
	if msg, ok := reasonMessages[err.Tag()]; ok {
		switch err.Tag() {
		case "min", "max": //  an extra param is needed (expected value)
			return fmt.Sprintf(msg, field, err.Param())
		default:
			return fmt.Sprintf(msg, field)
		}
	}
	return err.Error()
}

type FieldError struct {
	Field  string `json:"field"`
	Reason string `json:"reason"`
}

func Validate(s any) []FieldError {
	v := GetValidator()
	if err := v.Struct(s); err != nil {
		var ve validator.ValidationErrors
		if !errors.As(err, &ve) {
			return []FieldError{{Field: "Error", Reason: ve.Error()}}
		}

		errs := make([]FieldError, 0, len(ve))

		t := reflect.TypeOf(s)
		if t.Kind() == reflect.Pointer {
			t = t.Elem()
		}

		for _, e := range ve {
			f, ok := t.FieldByName(e.Field())
			name := e.Field()

			if ok {
				if tag, ok := f.Tag.Lookup("json"); ok {
					if tag != "-" {
						name = strings.Split(tag, ",")[0]
					}
				}
			}

			errs = append(errs, FieldError{Field: name, Reason: getErrorMessage(name, e)})
		}

		return errs
	}
	return nil
}
