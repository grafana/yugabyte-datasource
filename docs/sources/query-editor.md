---
aliases:
  - /docs/plugins/grafana-yugabyte-datasource/latest/editor/
  - /docs/plugins/grafana-yugabyte-datasource/editor/
description: Use the Yugabyte query editor to build SQL queries in Grafana
keywords:
  - grafana
  - yugabyte
  - yugabytedb
  - query editor
  - sql
  - macros
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Query editor
title: Yugabyte query editor
weight: 30
review_date: "2026-07-28"
---

# Yugabyte query editor

This document explains how to use the Yugabyte query editor to build and run SQL queries against your YugabyteDB database. For general information about querying in Grafana, refer to [Query and transform data](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/panels-visualizations/query-transform-data/).

## Before you begin

- [Configure the Yugabyte data source](https://grafana.com/docs/plugins/grafana-yugabyte-datasource/latest/configure/).
- Verify that your database user has permission to read the tables you want to query.

## Editor modes

The Yugabyte query editor provides two modes. Use the **Builder** and **Code** toggle at the top of the editor to switch between them.

### Builder

The query builder provides a visual interface for constructing queries. You select a table, choose columns, and add filters without writing SQL. It's useful if you prefer a guided approach or are less familiar with SQL syntax.

{{< figure src="/media/docs/yugabyte/yugabyte_explore_builder.png" max-width="800px" class="docs-image--no-shadow" caption="The Yugabyte query builder" >}}

The builder toolbar includes a **Format** drop-down and **Filter**, **Group**, **Order**, and **Preview** toggles that show or hide the corresponding sections. Configure your query with these options:

| Option | Description |
|--------|-------------|
| **Table** | The table to query. Grafana populates the list from the base tables in the configured database. |
| **Column** | The columns to return. Click **+** to add more columns. |
| **Aggregation** | Optional. An aggregation function to apply to the column: `AVG`, `COUNT`, `MAX`, `MIN`, or `SUM`. |
| **Filter by column value** | Optional. One or more `WHERE` conditions to limit the rows returned. Enable the **Filter** toggle to show this section. |
| **Group by column** | The columns to group by, typically used with an aggregation. Enable the **Group** toggle to show this section. |
| **Order by** | The column and direction used to sort the results. Enable the **Order** toggle to show this section. |
| **Limit** | Optional. The maximum number of rows to return. Defaults to `50`. |
| **Preview** | Enable the **Preview** toggle to show a read-only preview of the generated SQL. Switch to **Code** to edit the SQL directly. |

{{< admonition type="note" >}}
The Yugabyte data source queries a single database, which you set on the [configuration page](https://grafana.com/docs/plugins/grafana-yugabyte-datasource/latest/configure/). The builder doesn't include a schema or dataset selector.
{{< /admonition >}}

### Code

The raw SQL editor gives you full control to write queries directly. Use it for advanced queries that the builder doesn't support. The editor provides syntax highlighting and autocomplete.

{{< figure src="/media/docs/yugabyte/yugabyte_explore_code.png" max-width="800px" class="docs-image--no-shadow" caption="The Yugabyte raw SQL editor" >}}

Autocomplete suggests table names from the configured database and column names for the selected table, along with standard SQL keywords and functions.

## Format the query results

Use the **Format** drop-down at the top of the query editor to control how Grafana interprets the query results:

- **Table:** Returns the results as a table. Use this format for table panels or for exploring raw data.
- **Time series:** Returns the results as a time series. Your query must return a time-ordered column of `time` or `timestamp` type and at least one numeric column. Sort the results by the time column in ascending order.

## Macros

Macros are shorthand that Grafana expands into SQL before it runs the query. They let you write queries that respond to the dashboard time range. The Yugabyte data source supports the standard SQL macros:

| Macro | Description |
|-------|-------------|
| `$__timeFilter(column)` | Expands to a time-range condition on `column` using the dashboard time range, for example `column >= '2026-01-01T00:00:00Z' AND column <= '2026-01-02T00:00:00Z'`. |
| `$__timeFrom(column)` | Expands to a lower-bound condition on `column`, for example `column >= '2026-01-01T00:00:00Z'`. |
| `$__timeTo(column)` | Expands to an upper-bound condition on `column`, for example `column <= '2026-01-02T00:00:00Z'`. |
| `$__interval` | Expands to the dashboard's calculated interval as a duration string, for example `10m`. |
| `$__interval_ms` | Expands to the dashboard's calculated interval in milliseconds, for example `600000`. |

{{< admonition type="caution" >}}
To group results into time buckets, use a native YugabyteDB function such as `date_trunc()`. Avoid the `$__timeGroup` macro, because it generates `datepart()` syntax that isn't compatible with YugabyteDB.
{{< /admonition >}}

## Query examples

The following examples show common queries written in the Code editor.

### Return a time series

This query counts rows per minute and returns the result as a time series. It uses `date_trunc()` to group rows into one-minute buckets and `$__timeFilter()` to limit the results to the dashboard time range:

```sql
SELECT
  date_trunc('minute', created_at) AS time,
  count(*) AS orders
FROM orders
WHERE $__timeFilter(created_at)
GROUP BY time
ORDER BY time
```

### Return multiple series

This query returns one series per `service` by grouping on an additional column alongside the time bucket:

```sql
SELECT
  date_trunc('minute', created_at) AS time,
  service,
  avg(response_time) AS avg_response_time
FROM requests
WHERE $__timeFilter(created_at)
GROUP BY time, service
ORDER BY time
```

### Return tabular data

This query returns raw rows for a table panel:

```sql
SELECT id, name, status, created_at
FROM users
ORDER BY created_at DESC
LIMIT 100
```

## Use cases

Use the query editor to build dashboards for scenarios such as:

- **Application monitoring:** Track request counts, error rates, and latency stored in YugabyteDB over time.
- **Business metrics:** Visualize orders, sign-ups, or revenue aggregated by time buckets.
- **Operational reporting:** Build table panels that list recent records, such as the most recent orders or active users.

## Next steps

- [Use template variables](https://grafana.com/docs/plugins/grafana-yugabyte-datasource/latest/template-variables/) to build dynamic dashboards.
- [Add annotations](https://grafana.com/docs/plugins/grafana-yugabyte-datasource/latest/annotations/) to overlay events on your panels.
- [Set up alerting](https://grafana.com/docs/plugins/grafana-yugabyte-datasource/latest/alerting/) on your YugabyteDB data.
