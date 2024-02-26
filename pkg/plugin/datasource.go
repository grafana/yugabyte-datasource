package plugin

import (
	"context"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/yugabyte/pkg/models"
	"github.com/grafana/yugabyte/pkg/ycql"
	"github.com/grafana/yugabyte/pkg/ysql"

	_ "github.com/jackc/pgx/v5/stdlib"
)

type Datasource struct {
	settings backend.DataSourceInstanceSettings
}

var (
	_ backend.QueryDataHandler      = (*Datasource)(nil)
	_ backend.CheckHealthHandler    = (*Datasource)(nil)
	_ instancemgmt.InstanceDisposer = (*Datasource)(nil)
)

func NewDatasource(ctx context.Context, settings backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	return &Datasource{
		settings: settings,
	}, nil
}

func (ds *Datasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	response := backend.NewQueryDataResponse()

	for _, q := range req.Queries {
		res := ds.query(ctx, req.PluginContext, q)
		response.Responses[q.RefID] = res
	}

	return response, nil
}

func (ds *Datasource) query(ctx context.Context, pCtx backend.PluginContext, dataQuery backend.DataQuery) backend.DataResponse {
	var response backend.DataResponse

	query, err := models.LoadQuery(ctx, dataQuery)
	if err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, err.Error())
	}

	settings, err := models.LoadSettings(ctx, ds.settings)
	if err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, err.Error())
	}

	if query.QueryType == "YSQL" {
		response = ysql.Query(ctx, settings, query)
	} else {
		response = ycql.Query(ctx, settings, query)
	}

	return response
}

func (ds *Datasource) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	fail := &backend.CheckHealthResult{
		Status:  backend.HealthStatusError,
		Message: "Health check failed",
	}

	settings, err := models.LoadSettings(ctx, ds.settings)
	if err != nil {
		return fail, nil
	}

	response := ysql.Query(ctx, settings, models.QueryModel{RawSql: "SELECT 42"})

	rowLen, err := response.Frames[0].RowLen()
	if err != nil {
		return fail, nil
	}

	if response.Error != nil || len(response.Frames) != 1 || rowLen != 1 {
		return fail, nil
	}

	val := response.Frames[0].RowCopy(0)[0].(*int32)

	if *val != 42 {
		return fail, nil
	}

	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: "Data source is working",
	}, nil
}

// Dispose here tells plugin SDK that plugin wants to clean up resources when a new instance
// created. As soon as datasource settings change detected by SDK old datasource instance will
// be disposed and a new one will be created using NewSampleDatasource factory function.
func (ds *Datasource) Dispose() {
	// Clean up datasource instance resources.
}
