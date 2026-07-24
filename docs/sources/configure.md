---
aliases:
  - /docs/plugins/grafana-yugabyte-datasource/latest/setup/
  - /docs/plugins/grafana-yugabyte-datasource/setup/
description: Configure the Yugabyte data source in Grafana
keywords:
  - grafana
  - yugabyte
  - yugabytedb
  - data source
  - configuration
  - provisioning
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Configure
title: Configure the Yugabyte data source
weight: 20
review_date: "2026-07-24"
---

# Configure the Yugabyte data source

This document explains how to add and configure the Yugabyte data source in Grafana. After you configure the data source, refer to the [Yugabyte query editor](https://grafana.com/docs/plugins/grafana-yugabyte-datasource/latest/query-editor/) to start querying your data.

## Before you begin

Before you configure the data source, ensure you have:

- **Grafana permissions:** The `Organization administrator` role. Only organization administrators can add data sources.
- **A YugabyteDB instance:** The host and port of a running YugabyteDB instance that's reachable from Grafana. The default YSQL port is `5433`.
- **Database credentials:** A username and password for a database user with permission to query the target database.

## Add the data source

To add the Yugabyte data source:

1. Click **Connections** in the left-side menu.
1. Click **Add new connection**.
1. Enter `Yugabyte` in the search bar.
1. Select **Yugabyte**.
1. Click **Add new data source**.

## Configure settings

Set the following options to connect to your YugabyteDB instance:

| Setting | Description |
|---------|-------------|
| **Name** | The name used to refer to the data source in panels and queries. |
| **Default** | Toggle to make this the default data source that's pre-selected for new panels. |
| **Host URL** | The host name or IP address and port of your YugabyteDB instance, for example `localhost:5433`. |
| **Database** | The name of the YugabyteDB database to query. |

## Authentication

Provide the credentials Grafana uses to authenticate with YugabyteDB:

| Setting | Description |
|---------|-------------|
| **Username** | The database user's login name. |
| **Password** | The database user's password. The password is stored encrypted and isn't returned to the browser after you save the data source. |

### TLS and SSL

The Yugabyte data source doesn't provide TLS/SSL configuration options in the UI. It connects using the libpq `sslmode=allow` setting. With this setting, the connection uses TLS when the server requires it, but Grafana doesn't verify the server's certificate. If your YugabyteDB deployment enforces certificate verification, connect through [Secure Socks Proxy](#additional-settings) or a network tunnel that terminates TLS.

## Additional settings

The **Additional Settings** section contains optional configuration.

### Secure Socks Proxy

Enable **Secure Socks Proxy** to route the connection to your YugabyteDB instance through a SOCKS proxy. This is used with [Private data source connect (PDC)](https://grafana.com/docs/grafana-cloud/connect-externally-hosted/private-data-source-connect/) to query YugabyteDB instances on private networks from Grafana Cloud. When the proxy is enabled, host name resolution happens on the proxy side.

## Verify the connection

Click **Save & test** to verify the connection. When the connection succeeds, Grafana displays a **Data source is working** message. If the test fails, refer to [Troubleshoot Yugabyte data source issues](https://grafana.com/docs/plugins/grafana-yugabyte-datasource/latest/troubleshooting/).

## Provision the data source

You can define the data source in YAML files as part of Grafana's provisioning system. For more information about provisioning and available options, refer to [Provision Grafana](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/administration/provisioning/#data-sources).

The following example provisions a Yugabyte data source:

```yaml
apiVersion: 1

datasources:
  - name: Yugabyte
    type: grafana-yugabyte-datasource
    url: <HOST>:5433
    user: <USERNAME>
    jsonData:
      database: <DATABASE>
      # Optional: route the connection through Secure Socks Proxy (PDC).
      enableSecureSocksProxy: false
    secureJsonData:
      password: <PASSWORD>
```

Replace the placeholders with your own values:

- `<HOST>`: The host name or IP address of your YugabyteDB instance.
- `<USERNAME>`: The database user's login name.
- `<DATABASE>`: The name of the database to query.
- `<PASSWORD>`: The database user's password.
