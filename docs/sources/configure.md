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
- **A YugabyteDB instance:** The host and port of a running YugabyteDB instance that's reachable from Grafana. YugabyteDB accepts SQL connections on port `5433` by default.
- **Database credentials:** A username and password for a database user with permission to query the target database.

## Add the data source

To add the Yugabyte data source:

1. Click **Connections** in the left-side menu.
1. Click **Add new connection**.
1. Enter `Yugabyte` in the search bar.
1. Select **Yugabyte**.
1. Click **Add new data source**.

## Name and default

At the top of the settings page, set the data source name and choose whether it's the default:

| Setting | Description |
|---------|-------------|
| **Name** | The name used to refer to the data source in panels and queries. |
| **Default** | Toggle to make this the default data source, which Grafana pre-selects when you create a panel. |

## Connection

In the **Connection** section, set the options used to reach your YugabyteDB instance:

| Setting | Description | Required |
|---------|-------------|----------|
| **Host URL** | The host name or IP address and port of your YugabyteDB instance, for example `localhost:5433`. | Yes |
| **Database** | The name of the YugabyteDB database to query. | Yes |

## Authentication

In the **Authentication** section, provide the credentials Grafana uses to authenticate with YugabyteDB:

| Setting | Description | Required |
|---------|-------------|----------|
| **Username** | The database user's login name. | Yes |
| **Password** | The database user's password. Grafana stores the password encrypted and doesn't return it to the browser after you save the data source. | No |

### TLS and SSL

The Yugabyte data source doesn't provide TLS/SSL configuration options in the UI. It connects using the `sslmode=allow` connection setting. With this setting, the connection uses TLS when the server requires it, but Grafana doesn't verify the server's certificate. If your YugabyteDB deployment enforces certificate verification, connect through [Private data source connect](#private-data-source-connect) or a network tunnel that terminates TLS.

## Additional settings

The **Additional Settings** section contains optional configuration.

### Private data source connect

{{< admonition type="note" >}}
This feature is only available in Grafana Cloud.
{{< /admonition >}}

Use Private data source connect (PDC) to query a YugabyteDB instance that lives within a secured network, without opening that network to inbound traffic from Grafana Cloud. For more information about how PDC works, refer to [Private data source connect](https://grafana.com/docs/grafana-cloud/connect-externally-hosted/private-data-source-connect/).

Use the **Private data source connect network** drop-down to select a configured PDC network where your YugabyteDB instance is available. Use **Manage private data source connect networks** to configure and manage your PDC networks. After you make changes, click **Save & test** to preserve them.

On self-managed Grafana with the secure socks proxy enabled in the Grafana configuration, this setting instead appears as a **Secure Socks Proxy** toggle that routes the connection through the configured proxy.

## Verify the connection

Click **Save & test** to verify the connection. When the connection succeeds, Grafana displays a **Data source is working** message. If the test fails, refer to [Troubleshoot Yugabyte data source issues](https://grafana.com/docs/plugins/grafana-yugabyte-datasource/latest/troubleshooting/).

## Provision the data source

You can provision the Yugabyte data source as code, either with the Grafana file-based provisioning system or with the Grafana Terraform provider. Both approaches use the same connection values.

Replace the following placeholders in the examples with your own values:

- `<HOST>`: The host name or IP address of your YugabyteDB instance.
- `<USERNAME>`: The database user's login name.
- `<DATABASE>`: The name of the database to query.
- `<PASSWORD>`: The database user's password.

### Provision with a configuration file

You can define the data source in YAML files as part of the Grafana provisioning system. For more information about provisioning and available options, refer to [Provision Grafana](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/administration/provisioning/#data-sources).

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
      # Optional: enable Private data source connect (PDC) on Grafana Cloud.
      enableSecureSocksProxy: false
    secureJsonData:
      password: <PASSWORD>
```

### Provision with Terraform

You can provision the data source with the [Grafana Terraform provider](https://registry.terraform.io/providers/grafana/grafana/latest/docs) using the `grafana_data_source` resource. Pass the plugin's `jsonData` and `secureJsonData` values through the `json_data_encoded` and `secure_json_data_encoded` fields.

The following example provisions a Yugabyte data source:

```hcl
terraform {
  required_providers {
    grafana = {
      source = "grafana/grafana"
    }
  }
}

resource "grafana_data_source" "yugabyte" {
  type     = "grafana-yugabyte-datasource"
  name     = "Yugabyte"
  url      = "<HOST>:5433"
  username = "<USERNAME>"

  json_data_encoded = jsonencode({
    database = "<DATABASE>"
    # Optional: enable Private data source connect (PDC) on Grafana Cloud.
    enableSecureSocksProxy = false
  })

  secure_json_data_encoded = jsonencode({
    password = "<PASSWORD>"
  })
}
```
