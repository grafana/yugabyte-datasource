---
title: Configuration
description: This document outlines configuration options for the Yugabyte data source
weight: 20
hero:
  title: Configuring the Yugabyte data source plugin
  description: This document outlines configuration options for the Yugabyte data source.
  level: 1
---

{{< docs/hero-simple key="hero" >}}

Configuring the Yugabyte plugin is a two step process:

1. Installing the yugabyte plugin
2. Configuring the yugabyte data source

## Installing the Yugabyte plugin

To install a plugin, see [Install Grafana plugins](https://grafana.com/docs/grafana/latest/administration/plugin-management/#install-grafana-plugins).

To install the Yugabyte plugin, see [Installation](https://grafana.com/grafana/plugins/grafana-yugabyte-datasource/?tab=installation) on the Yugabyte plugin page.

## Configuring the Yugabyte data source

For general information on adding a data source see [Add a data source](https://grafana.com/docs/grafana/latest/administration/data-source-management/#add-a-data-source). Only users with the organization `administrator` role can add data sources.

Set the Yugabyte data source’s basic configuration options:

| Name         | Description                                                                           |
| ------------ | ------------------------------------------------------------------------------------- |
| **Name**     | The data source name. This is how you refer to the data source in panels and queries. |
| **Default**  | Default data source means that it will be pre-selected for new panels.                |
| **Host URL** | The IP address/hostname and port of your Yugabyte instance.                           |
| **Database** | Name of your Yugabyte database.                                                       |
| **User**     | Database user's login/username.                                                       |
| **Password** | Database user's password.                                                             |

### Configure the data source with provisioning

It is possible to configure data sources using configuration files with Grafana’s provisioning system. To read about how it works, including and all the settings that you can set for this data source, refer to [Provisioning Grafana data sources](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources).

Here is a provisioning example for this data source:

```yaml
apiVersion: 1
datasources:
  - name: Yugabyte
    type: grafana-yugabyte-datasource
    url: localhost:5433
    user: yugabyte
    jsonData:
      database: yb_demo
    secureJsonData:
      password: 123456
```
