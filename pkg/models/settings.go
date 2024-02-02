package models

import (
	"context"
	"encoding/json"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

type Settings struct {
	Url      string
	User     string
	Database string `json:"database"`
	Password string
}

func LoadSettings(ctx context.Context, dsSettings backend.DataSourceInstanceSettings) (*Settings, error) {
	settings := &Settings{
		Url:      dsSettings.URL,
		User:     dsSettings.User,
		Password: dsSettings.DecryptedSecureJSONData["password"],
	}

	err := json.Unmarshal(dsSettings.JSONData, settings)
	if err != nil {
		return nil, err
	}

	return settings, nil
}
