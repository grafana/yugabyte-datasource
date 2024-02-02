package models

import (
	"context"
	"encoding/json"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

type QueryModel struct {
	QueryType string `json:"queryType"`
	RawSql    string `json:"rawSql"`
}

func LoadQuery(ctx context.Context, dataQuery backend.DataQuery) (*QueryModel, error) {
	var query QueryModel

	err := json.Unmarshal(dataQuery.JSON, &query)
	if err != nil {
		return nil, err
	}

	return &query, nil
}
