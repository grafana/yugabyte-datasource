package ycql

import (
	"context"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/yugabyte/pkg/shared"
)

func Query(ctx context.Context, settings shared.Settings, query shared.QueryModel) backend.DataResponse {
	return backend.ErrDataResponse(backend.StatusNotImplemented, "YCQL support is currently under development")
}
