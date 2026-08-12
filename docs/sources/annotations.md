---
aliases:
  - /docs/plugins/grafana-yugabyte-datasource/latest/annotations/
  - /docs/plugins/grafana-yugabyte-datasource/annotations/
description: Use annotations with the Yugabyte data source to overlay events on Grafana panels
keywords:
  - grafana
  - yugabyte
  - yugabytedb
  - annotations
  - events
  - sql
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Annotations
title: Yugabyte annotations
weight: 50
review_date: "2026-07-28"
---

# Yugabyte annotations

Annotations overlay event markers on time-series panels, which lets you correlate the events stored in YugabyteDB, such as deployments, incidents, or maintenance windows, with the metrics on your dashboards. For general information about annotations, refer to [Annotate visualizations](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/dashboards/build-dashboards/annotate-visualizations/).

## Before you begin

- [Configure the Yugabyte data source](https://grafana.com/docs/plugins/grafana-yugabyte-datasource/latest/configure/).
- Store event data in YugabyteDB with a timestamp column that marks when each event occurred.

## How annotations work

The Yugabyte data source uses the standard Grafana annotation query format. You write a SQL query that returns a row for each event, and Grafana maps the columns to annotation properties by name, matched case-insensitively.

Grafana recognizes the following columns:

| Column | Required | Description |
|--------|----------|-------------|
| `time` | Yes | A timestamp that determines when the annotation appears on the timeline. If the query has no `time` column, Grafana uses the first time-typed column. |
| `text` | Yes | The annotation body text shown on hover. If the query has no `text` column, Grafana uses the first string column. |
| `timeEnd` | No | A timestamp for the end of the event. When present, Grafana draws the annotation as a region. |
| `title` | No | A title shown above the annotation text. |
| `tags` | No | A string of comma-separated tags. Grafana splits the value on commas and uses the tags to filter annotations. |

An annotation only renders when the query produces both a time value and a text value. Use the `$__timeFilter(column)` macro so the annotation query only returns events within the dashboard time range.

## Create an annotation query

To add an annotation query to a dashboard:

1. Open **Dashboard settings** > **Annotations**.
1. Click **Add annotation query**.
1. Enter a name for the annotation.
1. Select the **Yugabyte** data source.
1. Enter a SQL query that returns `time` and `text` values, plus any of the optional columns.
1. Click **Save dashboard**.

The annotations appear as markers on every time-series panel in the dashboard.

## Examples

The following examples show annotation queries for common event types. Adapt the table and column names to match your schema.

### Mark point-in-time events

This query marks deployment events on the timeline. Each row becomes a single marker at its `time` value, with the version shown as the title:

```sql
SELECT
  deployed_at AS time,
  version AS title,
  description AS text,
  environment AS tags
FROM deployments
WHERE $__timeFilter(deployed_at)
ORDER BY time
```

### Highlight a time range

Return a `timeEnd` column to draw a region annotation that spans a period, such as a maintenance window or an incident:

```sql
SELECT
  started_at AS time,
  resolved_at AS timeEnd,
  description AS text,
  severity AS tags
FROM incidents
WHERE $__timeFilter(started_at)
ORDER BY time
```

If an event hasn't ended, return `NULL` for `timeEnd` so Grafana renders it as a point-in-time marker instead of a region.

### Combine multiple tags

The `tags` column accepts a comma-separated string, so you can build it from several columns to make annotations easier to filter:

```sql
SELECT
  created_at AS time,
  summary AS text,
  concat(environment, ',', service) AS tags
FROM change_events
WHERE $__timeFilter(created_at)
ORDER BY time
```

### Filter events with a template variable

You can reference [template variables](https://grafana.com/docs/plugins/grafana-yugabyte-datasource/latest/template-variables/) in an annotation query to scope events to the current dashboard selection:

```sql
SELECT
  deployed_at AS time,
  description AS text
FROM deployments
WHERE environment = '$environment' AND $__timeFilter(deployed_at)
ORDER BY time
```

## Next steps

- Learn how to write queries in the [Yugabyte query editor](https://grafana.com/docs/plugins/grafana-yugabyte-datasource/latest/query-editor/).
- [Use template variables](https://grafana.com/docs/plugins/grafana-yugabyte-datasource/latest/template-variables/) to build dynamic dashboards.
