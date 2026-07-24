---
aliases:
  - /docs/plugins/grafana-yugabyte-datasource/latest/template-variables/
  - /docs/plugins/grafana-yugabyte-datasource/template-variables/
description: Use template variables with the Yugabyte data source in Grafana
keywords:
  - grafana
  - yugabyte
  - yugabytedb
  - template variables
  - dashboard variables
  - sql
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Template variables
title: Yugabyte template variables
weight: 40
review_date: "2026-07-24"
---

# Yugabyte template variables

Use template variables to create dynamic, reusable dashboards that let you change query parameters without editing individual panels. For general information about template variables, refer to [Templates and variables](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/dashboards/variables/).

## Before you begin

- [Configure the Yugabyte data source](https://grafana.com/docs/plugins/grafana-yugabyte-datasource/latest/configure/).
- Understand [Grafana template variables](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/dashboards/variables/).

## Supported variable types

The Yugabyte data source supports the following variable types:

| Variable type | Supported |
|---------------|-----------|
| Query | Yes |
| Custom | Yes |
| Data source | Yes |
| Ad hoc filters | No |

## Create a query variable

The variable query editor is a raw SQL editor with syntax highlighting and autocomplete. It's the same editor as the query editor's **Code** mode and doesn't include the visual builder.

To create a query variable:

1. Navigate to **Dashboard settings** > **Variables**.
1. Click **Add variable**.
1. Select **Query** as the variable type.
1. Select the **Yugabyte** data source.
1. Enter a SQL query that returns the values you want to use.
1. Grafana shows a preview of the returned values below the query editor.

## Query return format

Grafana determines variable values from the columns your query returns:

| Columns returned | Behavior |
|------------------|----------|
| One column | Each value is used as both the display text and the variable value. |
| A column named `text` and a column named `value` | The `text` column provides the display text and the `value` column provides the substituted value. |

Grafana matches the `text` and `value` columns by name, and both must be string columns. Cast numeric columns to text with `::text`, for example `id::text AS value`.

### Single-column example

This query returns a list of distinct regions for use as variable values:

```sql
SELECT DISTINCT region FROM sales ORDER BY region
```

### Text and value example

This query displays a human-readable name while substituting an ID into queries:

```sql
SELECT name AS text, id::text AS value FROM customers ORDER BY name
```

The variable drop-down displays `name` values, but the selected `id` is substituted into queries. The `id` column is cast to text with `::text` so Grafana recognizes it as the `value` column.

## Use variables in queries

Reference template variables in your SQL queries using the `$variable` or `${variable}` syntax. Single-value string variables are substituted as-is, so include quotes around string values in your query:

```sql
SELECT created_at AS time, count(*) AS orders
FROM orders
WHERE region = '$region' AND $__timeFilter(created_at)
GROUP BY time
ORDER BY time
```

For numeric values, omit the quotes:

```sql
SELECT * FROM orders WHERE total > $threshold
```

## Chained variables

You can build chained, or dependent, variables where one variable's query filters on the value selected in another variable. Because variable queries also expand template variables, you can reference an existing variable inside a query variable's SQL.

For example, if you have a `region` variable, create a dependent `city` variable that only lists cities in the selected region:

```sql
SELECT DISTINCT city FROM stores WHERE region = '$region' ORDER BY city
```

When you change the `region` selection, Grafana re-runs the `city` query and updates its available values.

## Multi-value variables

When a variable allows multiple selections, the Yugabyte data source formats the values as a comma-separated, single-quoted list. For example, if you select `pending`, `shipped`, and `delivered`, the variable expands to `'pending','shipped','delivered'`.

Use multi-value variables with the `IN` operator, and don't add quotes around the variable:

```sql
SELECT * FROM orders WHERE status IN ($status)
```

If you select `pending` and `shipped`, this expands to:

```sql
SELECT * FROM orders WHERE status IN ('pending','shipped')
```

Because the values are always single-quoted, this format is intended for string columns. For numeric columns, use string comparisons or cast the column as needed.

## Next steps

- Learn how to write queries in the [Yugabyte query editor](https://grafana.com/docs/plugins/grafana-yugabyte-datasource/latest/query-editor/).
- [Set up alerting](https://grafana.com/docs/plugins/grafana-yugabyte-datasource/latest/alerting/) on your YugabyteDB data.
