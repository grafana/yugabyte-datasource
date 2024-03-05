package main

import (
	"database/sql"
	"encoding/json"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data/sqlutil"
	"github.com/grafana/sqlds/v2"

	_ "github.com/jackc/pgx/v5/stdlib"
)

type Datasource struct{}

func (d *Datasource) Connect(s backend.DataSourceInstanceSettings, _ json.RawMessage) (*sql.DB, error) {
	settings, err := LoadSettings(s)
	if err != nil {
		return nil, err
	}

	connection, err := BuildConnectionString(settings)
	if err != nil {
		return nil, err
	}

	db, err := sql.Open("pgx", connection)
	if err != nil {
		return nil, err
	}

	return db, nil
}

func (d *Datasource) Converters() []sqlutil.Converter {
	return []sqlutil.Converter{}
}

func (d *Datasource) Macros() sqlds.Macros {
	return sqlds.Macros{}
}

func (d *Datasource) Settings(s backend.DataSourceInstanceSettings) sqlds.DriverSettings {
	return sqlds.DriverSettings{}
}
