package main

import (
	"github.com/grafana/yugabyte/pkg/models"
)

// // Settings and Connection are aliased from pkg/models so the settings model is
// // importable (for example by pkg/schema conformance tests) while keeping the
// // existing package main API unchanged.
// type Settings = models.Settings

type Connection = models.Connection

// func LoadSettings(s backend.DataSourceInstanceSettings) (models.Settings, error) {
// 	return models.LoadSettings(s)
// }

// func BuildConnectionString(s models.Settings) (string, error) {
// 	return models.BuildConnectionString(s)
// }
