package main

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/assert"
)

func TestConnect(t *testing.T) {
	settings := backend.DataSourceInstanceSettings{
		URL:                     "localhost:5433",
		User:                    "admin",
		DecryptedSecureJSONData: map[string]string{"password": "*****"},
		JSONData:                []byte(`{"database": "yb_demo"}`),
	}
	message := json.RawMessage(`{}`)

	ds := &Datasource{}
	ctx := context.Background()
	db, err := ds.Connect(ctx, settings, message)

	assert.NotNil(t, db, "Connect returned a nil db")
	assert.NoError(t, err, "Connect returned an error")
}
