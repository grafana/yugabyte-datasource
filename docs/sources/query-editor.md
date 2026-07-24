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
review_date: "2026-07-24"
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

The builder supports the following options:

| Option | Description |
|--------|-------------|
| **Table** | The table to query. The list is populated from the base tables in the configured database. |
| **Column** | The columns to return. You can select multiple columns and apply an aggregation function to a column. |
| **Aggregation** | An aggregation function to apply to a column: `AVG`, `COUNT`, `MAX`, `MIN`, or `SUM`. |
| **Filter** | One or more `WHERE` conditions to limit the rows returned. |
| **Group** | The columns to group by, typically used with an aggregation. |
| **Order** | The column and direction used to sort the results, with an optional row limit. |
| **Preview** | A read-only preview of the generated SQL. Switch to **Code** to edit the SQL directly. |

{{< admonition type="note" >}}
The Yugabyte data source queries a single database, which you set on the [configuration page](https://grafana.com/docs/plugins/grafana-yugabyte-datasource/latest/configure/). The builder doesn't include a schema or dataset selector.
{{< /admonition >}}

### Code

The raw SQL editor gives you full control to write queries directly. Use it for advanced queries that the builder doesn't support. The editor provides syntax highlighting and autocomplete.

{{< figure src="/media/docs/yugabyte/yugabyte_explore_code.png" max-width="800px" class="docs-image--no-shadow" caption="The Yugabyte raw SQL editor" >}}

Autocomplete suggests table names from the configured database and column names for the selected table, along with standard SQL keywords and functions.

## Format the query results

Use the **Format** option to control how Grafana interprets the query results:

- **Table:** Returns the results as a table. Use this format for table panels or for exploring raw data.
- **Time series:** Returns the results as a time series. Your query must return a time-ordered column of `time` or `timestamp` type and at least one numeric column. Sort the results by the time column in ascending order.

## Macros

Macros are shorthand that Grafana expands into SQL before running the query. They let you write queries that respond to the dashboard time range and interval.

| Macro | Description |
|-------|-------------|
| `$__timeFilter(column)` | Expands to a time-range condition on `column` using the dashboard time range, for example `column BETWEEN '...' AND '...'`. |
| `$__timeFrom()` | Expands to the start of the dashboard time range. |
| `$__timeTo()` | Expands to the end of the dashboard time range. |
| `$__timeGroup(column, interval)` | Groups rows into time buckets of size `interval` based on `column`. |
| `$__interval` | Expands to the dashboard's calculated interval as a duration. |
| `$__interval_ms` | Expands to the dashboard's calculated interval in milliseconds. |
| `$__table` | Expands to the table referenced by the query. |
| `$__column` | Expands to the column referenced by the query. |

## Query examples

The following examples show common queries written in the Code editor.

### Return a time series

This query returns a numeric metric over time, formatted as a time series:

```sql
SELECT
  created_at AS time,
  count(*) AS orders
FROM orders
WHERE $__timeFilter(created_at)
GROUP BY time
ORDER BY time
```

### Aggregate into time buckets

This query groups rows into time buckets that match the dashboard interval:

```sql
SELECT
  $__timeGroup(created_at, $__interval) AS time,
  avg(response_time) AS avg_response_time
FROM requests
WHERE $__timeFilter(created_at)
GROUP BY time
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

## Annotations

The Yugabyte data source supports annotations, which overlay event markers on time-series panels. It uses Grafana's standard annotation query format, so your annotation query must return specific columns.

To add an annotation query, open **Dashboard settings** > **Annotations**, click **Add annotation query**, and select the **Yugabyte** data source. For general information, refer to [Annotate visualizations](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/dashboards/build-dashboards/annotate-visualizations/).

The following table describes the fields Grafana recognizes:

| Field | Required | Description |
|-------|----------|-------------|
| `time` | Yes | A timestamp column that determines when the annotation appears on the timeline. |
| `timeEnd` | No | A timestamp column for the end of a range annotation. |
| `text` | No | A string column with the annotation body text shown on hover. |
| `tags` | No | A string column with comma-separated tags for filtering annotations. |

The following query marks deployment events on a dashboard:

```sql
SELECT
  deployed_at AS time,
  description AS text,
  environment AS tags
FROM deployments
WHERE $__timeFilter(deployed_at)
ORDER BY time
```

## Next steps

- [Use template variables](https://grafana.com/docs/plugins/grafana-yugabyte-datasource/latest/template-variables/) to build dynamic dashboards.
- [Set up alerting](https://grafana.com/docs/plugins/grafana-yugabyte-datasource/latest/alerting/) on your YugabyteDB data.
