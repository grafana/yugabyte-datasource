---
aliases:
  - /docs/plugins/grafana-yugabyte-datasource/latest/alerting/
  - /docs/plugins/grafana-yugabyte-datasource/alerting/
description: Set up Grafana Alerting with the Yugabyte data source
keywords:
  - grafana
  - yugabyte
  - yugabytedb
  - alerting
  - alert rules
  - sql
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Alerting
title: Yugabyte alerting
weight: 50
review_date: "2026-07-24"
---

# Yugabyte alerting

The Yugabyte data source supports Grafana Alerting, which lets you define alert rules that evaluate SQL queries against YugabyteDB and trigger notifications when conditions are met. For general information about Grafana Alerting, refer to [Alerting](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/alerting/).

## Before you begin

- [Configure the Yugabyte data source](https://grafana.com/docs/plugins/grafana-yugabyte-datasource/latest/configure/).
- Understand [Grafana Alerting concepts](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/alerting/fundamentals/).

## Query requirements for alerting

Alert rules evaluate query results to determine whether a condition is met. Yugabyte alert queries have the following requirements:

- **Numeric results:** The query must return at least one numeric column for Grafana to evaluate against a threshold or condition.
- **Reduce to a single value:** Add a **Reduce** expression to collapse a time series into a single number that the alert condition can evaluate.
- **Time filtering:** Use the `$__timeFilter(column)` macro so the query only evaluates data within the alert's evaluation window.
- **One series per alert instance:** If the query returns multiple series, for example by adding a `GROUP BY service` column, Grafana creates a separate alert instance for each series. Return a single series unless you intend to alert on each series independently.

You can combine multiple queries (A, B, C) with Reduce and Math expressions to build complex alert conditions. Refer to [Queries and conditions](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/alerting/fundamentals/alert-rules/queries-conditions/) for details.

## Create an alert rule

To create an alert rule using the Yugabyte data source:

1. Navigate to **Alerting** > **Alert rules** in the left-side menu.
1. Click **New alert rule**.
1. Select the **Yugabyte** data source.
1. Enter a SQL query that returns a numeric result.
1. Add a **Reduce** expression to aggregate the query result, for example **Last** or **Mean**.
1. Add a **Threshold** expression to define the alert condition, for example "is above 90".
1. Set the evaluation interval and pending period.
1. Configure notification settings, including contact points and notification policies.
1. Click **Save rule and exit**.

## Alert query examples

The following examples show SQL queries suitable for alert rules.

### Alert on error count

This query returns the number of errors over time for a specific service:

```sql
SELECT
  date_trunc('minute', created_at) AS time,
  count(*) AS errors
FROM logs
WHERE level = 'error' AND $__timeFilter(created_at)
GROUP BY time
ORDER BY time
```

Configure a **Reduce** expression with **Last** to get the most recent value, then add a **Threshold** expression set to "is above 100".

### Alert on average response time

This query returns average response time, which is useful for detecting latency degradation:

```sql
SELECT
  date_trunc('minute', created_at) AS time,
  avg(response_time) AS avg_response_time
FROM requests
WHERE service = 'checkout' AND $__timeFilter(created_at)
GROUP BY time
ORDER BY time
```

Configure a **Reduce** expression with **Mean**, then add a **Threshold** expression set to "is above 2000".

### Combine multiple queries

You can use multiple queries to compare values. For example, to alert when the error rate exceeds a percentage of total requests:

**Query A** -- error count:

```sql
SELECT
  date_trunc('minute', created_at) AS time,
  count(*) AS errors
FROM logs
WHERE level = 'error' AND $__timeFilter(created_at)
GROUP BY time
ORDER BY time
```

**Query B** -- total request count:

```sql
SELECT
  date_trunc('minute', created_at) AS time,
  count(*) AS requests
FROM logs
WHERE $__timeFilter(created_at)
GROUP BY time
ORDER BY time
```

Add **Reduce** expressions for each query using **Last**, then add a **Math** expression with the formula `$A / $B * 100` to calculate the error percentage. Add a **Threshold** expression set to "is above 5" to alert when errors exceed 5% of requests.

## Next steps

- Refer to the full [Grafana Alerting documentation](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/alerting/) for details on alert conditions, notification policies, and contact points.
- Learn how to write queries in the [Yugabyte query editor](https://grafana.com/docs/plugins/grafana-yugabyte-datasource/latest/query-editor/).
- [Troubleshoot Yugabyte data source issues](https://grafana.com/docs/plugins/grafana-yugabyte-datasource/latest/troubleshooting/) if alerts aren't firing as expected.
