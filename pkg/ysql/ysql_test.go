package ysql

import (
	"testing"

	"github.com/grafana/yugabyte/pkg/models"
)

func TestBuildConnectionString(t *testing.T) {
	t.Run("Returns a connection string given valid settings", func(t *testing.T) {
		settings := models.Settings{Url: "localhost:5433", Database: "grafana", User: "yugabyte", Password: "1234"}
		expected := "host='localhost' port='5433' database='grafana' user='yugabyte' password='1234' sslmode='allow'"

		result, err := buildConnectionString(settings)
		if err != nil {
			t.Errorf("Expected: %s, got: %s", expected, err)
		}

		if result != expected {
			t.Errorf("Expected: %s, got: %s", expected, result)
		}
	})

	t.Run("Returns an error when passed invalid URL", func(t *testing.T) {
		settings := models.Settings{Url: "localhost", Database: "grafana", User: "yugabyte", Password: "1234"}

		result, err := buildConnectionString(settings)
		if err == nil {
			t.Errorf("Expected: error missing port in address, got: %s", result)
		}
	})
}
