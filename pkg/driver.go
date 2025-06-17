package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/data/sqlutil"
	"github.com/grafana/sqlds/v4"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/stdlib"
)

type Datasource struct{}

func (d *Datasource) Connect(ctx context.Context, config backend.DataSourceInstanceSettings, _ json.RawMessage) (*sql.DB, error) {
	settings, err := LoadSettings(config)
	if err != nil {
		return nil, err
	}

	connection, err := BuildConnectionString(settings)
	if err != nil {
		return nil, err
	}

	pgxConf, err := pgx.ParseConfig(connection)
	if err != nil {
		return nil, fmt.Errorf("unable to parse connection string: %w", err)
	}

	proxyClient, err := config.ProxyClient(ctx)
	if err != nil {
		return nil, err
	}

	if proxyClient.SecureSocksProxyEnabled() {
		dialer, err := proxyClient.NewSecureSocksProxyContextDialer()
		if err != nil {
			log.DefaultLogger.Error("yugabyte proxy creation failed", "error", err)
			return nil, fmt.Errorf("yugabyte proxy creation failed")
		}

		pgxConf.DialFunc = newPgxDialFunc(dialer)
		// We need resolution to happen on the proxy side
		pgxConf.LookupFunc = func(ctx context.Context, host string) ([]string, error) {
			return []string{host}, nil
		}
	}

	db := stdlib.OpenDB(*pgxConf)

	return db, nil
}

func (d *Datasource) Converters() []sqlutil.Converter {
	return []sqlutil.Converter{}
}

func (d *Datasource) Macros() sqlds.Macros {
	return sqlds.Macros{}
}

func (d *Datasource) Settings(ctx context.Context, s backend.DataSourceInstanceSettings) sqlds.DriverSettings {
	return sqlds.DriverSettings{}
}
