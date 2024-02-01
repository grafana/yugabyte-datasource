package models

type QueryModel struct {
	QueryType string `json:"queryType"`
	RawSql    string `json:"rawSql"`
}
