package plugin

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"math/rand"
	"net"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/data/sqlutil"

	_ "github.com/jackc/pgx/v5/stdlib"
)

type Datasource struct {
	settings backend.DataSourceInstanceSettings
}

type Settings struct {
	url      string
	user     string
	database string
	password string
}

type JSONData struct {
	Database string `json:"database"`
}

type QueryModel struct {
	QueryType string `json:"queryType"`
	RawSql    string `json:"rawSql"`
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

func (ds *Datasource) LoadSettings(ctx context.Context) (*Settings, error) {
	JSONData := &JSONData{}

	err := json.Unmarshal(ds.settings.JSONData, &JSONData)
	if err != nil {
		return nil, err
	}

	return &Settings{
		url:      ds.settings.URL,
		user:     ds.settings.User,
		database: JSONData.Database,
		password: ds.settings.DecryptedSecureJSONData["password"],
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
	var query QueryModel

	err := json.Unmarshal(dataQuery.JSON, &query)
	if err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, err.Error())
	}

	if query.QueryType == "YSQL" {
		response = ds.handleYSQL(ctx, query)
	} else {
		response = ds.handleYCQL(ctx, query)
	}

	return response
}

func (ds *Datasource) handleYSQL(ctx context.Context, query QueryModel) backend.DataResponse {
	var response backend.DataResponse

	settings, err := ds.LoadSettings(ctx)
	if err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, err.Error())
	}

	host, port, err := net.SplitHostPort(settings.url)
	if err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, err.Error())
	}

	connection := fmt.Sprintf("host='%s' port='%s' database='%s' user='%s' password='%s' sslmode='disable'", host, port, settings.database, settings.user, settings.password)

	db, err := sql.Open("pgx", connection)
	if err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, err.Error())
	}

	defer db.Close()

	rows, err := db.QueryContext(ctx, query.RawSql)
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

func (ds *Datasource) handleYCQL(ctx context.Context, query QueryModel) backend.DataResponse {
	return backend.ErrDataResponse(backend.StatusNotImplemented, "YCQL support is currently under development")
}

// CheckHealth handles health checks sent from Grafana to the plugin.
// The main use case for these health checks is the test button on the
// datasource configuration page which allows users to verify that
// a datasource is working as expected.
func (ds *Datasource) CheckHealth(_ context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	var status = backend.HealthStatusOk
	var message = "Data source is working"

	if rand.Int()%2 == 0 {
		status = backend.HealthStatusError
		message = "randomized error"
	}

	return &backend.CheckHealthResult{
		Status:  status,
		Message: message,
	}, nil
}

// Dispose here tells plugin SDK that plugin wants to clean up resources when a new instance
// created. As soon as datasource settings change detected by SDK old datasource instance will
// be disposed and a new one will be created using NewSampleDatasource factory function.
func (ds *Datasource) Dispose() {
	// Clean up datasource instance resources.
}
