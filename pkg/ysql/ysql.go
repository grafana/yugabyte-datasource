package ysql

import (
	"context"
	"database/sql"
	"fmt"
	"net"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data/sqlutil"
	"github.com/grafana/yugabyte/pkg/models"
)

func Query(ctx context.Context, settings models.Settings, query models.QueryModel) backend.DataResponse {
	var response backend.DataResponse

	rows, err := ExecuteYSQL(ctx, settings, query)
	if err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, err.Error())
	}

	frame, err := sqlutil.FrameFromRows(rows, 1_000_000)
	if err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, err.Error())
	}

	response.Frames = append(response.Frames, frame)
	return response
}

func ExecuteYSQL(ctx context.Context, settings models.Settings, query models.QueryModel) (*sql.Rows, error) {
	connection, err := buildConnectionString(settings)
	if err != nil {
		return nil, err
	}

	db, err := sql.Open("pgx", connection)
	if err != nil {
		return nil, err
	}

	defer db.Close()

	rows, err := db.QueryContext(ctx, query.RawSql)
	if err != nil {
		return nil, err
	}

	return rows, nil
}

func buildConnectionString(settings models.Settings) (string, error) {
	host, port, err := net.SplitHostPort(settings.Url)
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("host='%s' port='%s' database='%s' user='%s' password='%s' sslmode='allow'", host, port, settings.Database, settings.User, settings.Password), nil
}
