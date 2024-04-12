package main

import (
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/assert"
)

type LoadSettingsTestCase struct {
	name        string
	instance    backend.DataSourceInstanceSettings
	expected    Settings
	shouldError bool
}

func TestLoadSettings(t *testing.T) {
	tests := []LoadSettingsTestCase{
		{
			name: "Valid Instance Settings",
			instance: backend.DataSourceInstanceSettings{
				URL:                     "localhost:5433",
				User:                    "admin",
				DecryptedSecureJSONData: map[string]string{"password": "*****"},
				JSONData:                []byte(`{"database": "yb_demo"}`),
			},
			expected: Settings{
				Connection: Connection{Url: "localhost:5433", Host: "localhost", Port: "5433"},
				User:       "admin",
				Password:   "*****",
				Database:   "yb_demo",
			},
			shouldError: false,
		},
		{
			name: "Invalid URL (missing port)",
			instance: backend.DataSourceInstanceSettings{
				URL:                     "localhost",
				User:                    "admin",
				DecryptedSecureJSONData: map[string]string{"password": "*****"},
				JSONData:                []byte(`{"database": "yb_demo"}`),
			},
			expected:    Settings{},
			shouldError: true,
		},
		{
			name: "Invalid JSON",
			instance: backend.DataSourceInstanceSettings{
				URL:                     "localhost:5433",
				User:                    "admin",
				DecryptedSecureJSONData: map[string]string{"password": "*****"},
				JSONData:                []byte(`{invalid json}`),
			},
			expected:    Settings{},
			shouldError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			settings, err := LoadSettings(tt.instance)
			if tt.shouldError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expected, settings)
			}
		})
	}
}

func TestBuildConnectionString(t *testing.T) {
	settings := Settings{
		Connection: Connection{
			Url:  "localhost:5433",
			Host: "localhost",
			Port: "5433",
		},
		User:     "admin",
		Password: "*****",
		Database: "yb_demo",
	}

	expected := "host='localhost' port='5433' user='admin' password='*****' database='yb_demo' sslmode='allow'"
	str, err := BuildConnectionString(settings)
	assert.NoError(t, err)
	assert.Equal(t, expected, str)
}
