package main

import (
	"context"
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/assert"
)

func TestDatasourceFactory(t *testing.T) {
	ctx := context.Background()
	settings := backend.DataSourceInstanceSettings{
		URL:                     "localhost:5433",
		User:                    "admin",
		DecryptedSecureJSONData: map[string]string{"password": "*****"},
		JSONData:                []byte(`{"database": "yb_demo"}`),
	}

	_, err := datasourceFactory(ctx, settings)
	assert.NoError(t, err)
}
