package plugin

import (
	"context"
	"encoding/json"

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

type JSONData struct {
	Database string `json:"database"`
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

func (ds *Datasource) LoadSettings(ctx context.Context) (*models.Settings, error) {
	JSONData := &JSONData{}

	err := json.Unmarshal(ds.settings.JSONData, &JSONData)
	if err != nil {
		return nil, err
	}

	return &models.Settings{
		Url:      ds.settings.URL,
		User:     ds.settings.User,
		Database: JSONData.Database,
		Password: ds.settings.DecryptedSecureJSONData["password"],
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
	var query models.QueryModel

	err := json.Unmarshal(dataQuery.JSON, &query)
	if err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, err.Error())
	}

	settings, err := ds.LoadSettings(ctx)
	if err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, err.Error())
	}

	if query.QueryType == "YSQL" {
		response = ysql.Query(ctx, *settings, query)
	} else {
		response = ycql.Query(ctx, *settings, query)
	}

	return response
}

func (ds *Datasource) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	fail := &backend.CheckHealthResult{
		Status:  backend.HealthStatusError,
		Message: "Health check failed",
	}

	settings, err := ds.LoadSettings(ctx)
	if err != nil {
		return fail, nil
	}

	rows, err := ysql.ExecuteYSQL(ctx, *settings, models.QueryModel{QueryType: "YSQL", RawSql: "SELECT 1"})
	if err != nil {
		return fail, nil
	}

	var value int
	if rows.Next() {
		err := rows.Scan(&value)
		if err != nil || value != 1.000 {
			return fail, nil
		}
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
