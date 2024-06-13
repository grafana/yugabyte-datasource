---
title: Configure the Yugabyte data source
description: This document outlines configuration options for the Yugabyte data source
weight: 20
---

# Install the Yugabyte data source

To install a data source, see [Install Grafana plugins](https://grafana.com/docs/grafana/latest/administration/plugin-management/#install-grafana-plugins). For general information on adding a data source see [Add a data source](https://grafana.com/docs/grafana/latest/administration/data-source-management/#add-a-data-source).

Only users with the organization `administrator` role can add data sources. Administrators can also configure the data source via YAML with [Grafana’s provisioning system](https://grafana.com/docs/grafana/latest/administration/provisioning/).

To install the Yugabyte plugin, see [Installation](https://grafana.com/grafana/plugins/grafana-yugabyte-datasource/?tab=installation) on the Yugabyte plugin page.

# Configure the Yugabyte data source

Set the data source’s basic configuration options:

| Name                        | Description                                                                                                                                                                                                                                                                                                                                                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**                    | The data source name. This is how you refer to the data source in panels and queries.                                                                                                                                                                                                                                                                                                                                   |
| **Default**                 | Default data source means that it will be pre-selected for new panels.                                                                                                                                                                                                                                                                                                                                                  |
| **Host URL**                | The IP address/hostname and port of your Yugabyte instance.
| **Database**                | Name of your Yugabyte database.                                                                                                                                                                                                                                                                                                                                                                                       |
| **User**                    | Database user's login/username                                                                                                                                                                                                                                                                                                                                                                                          |
| **Password**                | Database user's password                                                                                                                                                                                                                                                                                                                                                                                                |

## Configure the data source with provisioning

It is possible to configure data sources using configuration files with Grafana’s provisioning system. To read about how it works, including and all the settings that you can set for this data source, refer to [Provisioning Grafana data sources](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources).

Here are some provisioning examples for this data source:

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
