package main

import (
	"fmt"
	"net"
	"testing"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/stdlib"
	"github.com/stretchr/testify/require"
	"golang.org/x/net/proxy"
)

type testDialer struct {
}

func (d *testDialer) Dial(network, addr string) (c net.Conn, err error) {
	return nil, fmt.Errorf("test-dialer is not functional")
}

var _ proxy.Dialer = (&testDialer{})

func TestPostgresProxyDriver(t *testing.T) {
	dbURL := "localhost:5433"
	cnnStr := fmt.Sprintf("postgres://user:password@%s/db?sslmode=disable", dbURL)

	t.Run("Connector should use dialer context that routes through the socks proxy to db", func(t *testing.T) {
		pgxConf, err := pgx.ParseConfig(cnnStr)
		require.NoError(t, err)

		pgxConf.DialFunc = newPgxDialFunc(&testDialer{})

		db := stdlib.OpenDB(*pgxConf)

		err = db.Ping()

		require.Contains(t, err.Error(), "test-dialer is not functional")
	})
}
