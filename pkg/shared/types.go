package shared

type Settings struct {
	Url      string
	User     string
	Database string
	Password string
}

type QueryModel struct {
	QueryType string `json:"queryType"`
	RawSql    string `json:"rawSql"`
}
