package models

import (
	"context"
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

func TestLoadSettings(t *testing.T) {
	ctx := context.Background()

	t.Run("Returns settings with correct values", func(t *testing.T) {
		dsSettings := backend.DataSourceInstanceSettings{
			URL:  "localhost:5433",
			User: "yugabyte",
			DecryptedSecureJSONData: map[string]string{
				"password": "1234",
			},
			JSONData: []byte(`{"database": "grafana"}`),
		}

		expected := &Settings{
			Url:      "localhost:5433",
			User:     "yugabyte",
			Password: "1234",
			Database: "grafana",
		}

		settings, err := LoadSettings(ctx, dsSettings)
		if err != nil {
			t.Errorf("Unexpected error: %v", err)
		}

		if settings.Url != expected.Url {
			t.Errorf("Unexpected URL. Expected: %s, got: %s", expected.Url, settings.Url)
		}

		if settings.User != expected.User {
			t.Errorf("Unexpected user. Expected: %s, got: %s", expected.User, settings.User)
		}

		if settings.Password != expected.Password {
			t.Errorf("Unexpected password. Expected: %s, got: %s", expected.Password, settings.Password)
		}

		if settings.Database != expected.Database {
			t.Errorf("Unexpected database. Expected: %s, got: %s", expected.Database, settings.Database)
		}
	})

	t.Run("Returns error when JSON unmarshal fails", func(t *testing.T) {
		dsSettings := backend.DataSourceInstanceSettings{
			URL:  "localhost:5433",
			User: "yugabyte",
			DecryptedSecureJSONData: map[string]string{
				"password": "1234",
			},
			JSONData: []byte(`invalid json`),
		}

		_, err := LoadSettings(ctx, dsSettings)
		if err == nil {
			t.Error("Expected error")
		}
	})
}
