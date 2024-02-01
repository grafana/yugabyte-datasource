package ycql

import (
	"context"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/yugabyte/pkg/models"
)

func Query(ctx context.Context, settings models.Settings, query models.QueryModel) backend.DataResponse {
	return backend.ErrDataResponse(backend.StatusNotImplemented, "YCQL support is currently under development")
}
