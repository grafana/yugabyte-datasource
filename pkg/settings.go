package main

import (
	"encoding/json"
	"fmt"
	"net"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

type Settings struct {
	Connection Connection
	User       string
	Password   string
	Database   string `json:"database"`
}

type Connection struct {
	Url  string
	Host string
	Port string
}

func LoadSettings(s backend.DataSourceInstanceSettings) (Settings, error) {
	host, port, err := net.SplitHostPort(s.URL)
	if err != nil {
		return Settings{}, err
	}

	connection := Connection{
		Url:  s.URL,
		Host: host,
		Port: port,
	}

	settings := Settings{
		Connection: connection,
		User:       s.User,
		Password:   s.DecryptedSecureJSONData["password"],
		Database:   "",
	}

	err = json.Unmarshal(s.JSONData, &settings)
	if err != nil {
		return Settings{}, err
	}

	return settings, nil
}

func BuildConnectionString(s Settings) (string, error) {
	str := fmt.Sprintf("host='%s' port='%s' user='%s' password='%s' database='%s' sslmode='allow'",
		s.Connection.Host,
		s.Connection.Port,
		s.User,
		s.Password,
		s.Database,
	)

	return str, nil
}
