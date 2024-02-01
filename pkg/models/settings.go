package models

import (
	"context"
	"encoding/json"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

type Settings struct {
	Url      string
	User     string
	Database string
	Password string
}

type JSONData struct {
	Database string `json:"database"`
}

func LoadSettings(ctx context.Context, dsSettings backend.DataSourceInstanceSettings) (*Settings, error) {
	JSONData := &JSONData{}

	err := json.Unmarshal(dsSettings.JSONData, &JSONData)
	if err != nil {
		return nil, err
	}

	return &Settings{
		Url:      dsSettings.URL,
		User:     dsSettings.User,
		Database: JSONData.Database,
		Password: dsSettings.DecryptedSecureJSONData["password"],
	}, nil
}
