package plugin

import (
	"context"
	"reflect"
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

func TestNewDatasource(t *testing.T) {
	ctx := context.Background()
	settings := backend.DataSourceInstanceSettings{}

	instance, err := NewDatasource(ctx, settings)
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}

	ds, ok := instance.(*Datasource)
	if !ok {
		t.Errorf("Unexpected instance type: %T", instance)
	}

	if !reflect.DeepEqual(ds.settings, settings) {
		t.Errorf("Unexpected settings value: got %v, want %v", ds.settings, settings)
	}
}

func TestQueryData(t *testing.T) {
	ds := Datasource{}
	request := &backend.QueryDataRequest{Queries: []backend.DataQuery{{RefID: "A"}}}

	response, err := ds.QueryData(context.Background(), request)
	if err != nil {
		t.Error(err)
	}

	if len(response.Responses) != 1 {
		t.Fatal("QueryData must return a response")
	}
}
