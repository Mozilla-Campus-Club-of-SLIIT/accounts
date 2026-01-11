package helpers

import (
	"errors"
	"fmt"
	"reflect"
	"strings"

	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate
var reasonMessages map[string]string = map[string]string{
	"required": "%s is required",
	"email":    "%s should be a valid email",
}

func GetValidator() *validator.Validate {
	if validate == nil {
		validate = validator.New(validator.WithRequiredStructEnabled())
	}
	return validate
}

func getErrorMessage(field string, err validator.FieldError) string {
	if msg, ok := reasonMessages[err.Tag()]; ok {
		return fmt.Sprintf(msg, field)
	}
	return err.Error()
}

func Validate(s any) []string {
	v := GetValidator()
	if err := v.Struct(s); err != nil {
		var ve validator.ValidationErrors
		if !errors.As(err, &ve) {
			return []string{err.Error()}
		}

		errs := make([]string, 0, len(ve))

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

			errs = append(errs, getErrorMessage(name, e))
		}

		return errs
	}
	return nil
}
