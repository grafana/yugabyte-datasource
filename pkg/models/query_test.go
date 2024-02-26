package models

import (
	"context"
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

func TestLoadQuery(t *testing.T) {
	ctx := context.Background()

	t.Run("Returns query with correct values", func(t *testing.T) {
		dataQuery := backend.DataQuery{JSON: []byte(`{"rawSql": "SELECT 42;"}`)}
		expected := &QueryModel{RawSql: "SELECT 42;"}

		query, err := LoadQuery(ctx, dataQuery)
		if err != nil {
			t.Error(err)
		}

		if query.RawSql != expected.RawSql {
			t.Errorf("Unexpected query. Expected: %s, got: %s", expected.RawSql, query.RawSql)
		}
	})

	t.Run("Returns error when JSON unmarshal fails", func(t *testing.T) {
		dataQuery := backend.DataQuery{
			JSON: []byte(`invalid json`),
		}

		_, err := LoadQuery(ctx, dataQuery)
		if err == nil {
			t.Error("Expected error")
		}
	})
}
