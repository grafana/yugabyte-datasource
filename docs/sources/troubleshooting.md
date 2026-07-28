---
aliases:
  - /docs/plugins/grafana-yugabyte-datasource/latest/troubleshooting/
  - /docs/plugins/grafana-yugabyte-datasource/troubleshooting/
description: Troubleshooting guide for the Yugabyte data source in Grafana
keywords:
  - grafana
  - yugabyte
  - yugabytedb
  - troubleshooting
  - errors
  - connection
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Troubleshooting
title: Troubleshoot Yugabyte data source issues
weight: 70
review_date: "2026-07-28"
---

# Troubleshoot Yugabyte data source issues

This document provides solutions to common issues you might encounter when you configure or use the Yugabyte data source. For configuration instructions, refer to [Configure the Yugabyte data source](https://grafana.com/docs/plugins/grafana-yugabyte-datasource/latest/configure/).

## Connection errors

These errors occur when Grafana can't reach your YugabyteDB instance.

### "Connection refused" or timeout errors

**Symptoms:**

- **Save & test** times out or fails with a network error.
- Queries fail with connection errors.

**Possible causes and solutions:**

| Cause | Solution |
|-------|----------|
| YugabyteDB isn't reachable from Grafana | Verify network connectivity from the Grafana server to the YugabyteDB host and port. The default YSQL port is `5433`. |
| Firewall blocks the connection | Allow outbound access from Grafana to the YugabyteDB host and port. |
| Private network | For Grafana Cloud, configure [Private data source connect](https://grafana.com/docs/grafana-cloud/connect-externally-hosted/private-data-source-connect/) and select a PDC network in the data source's [Private data source connect](https://grafana.com/docs/plugins/grafana-yugabyte-datasource/latest/configure/#private-data-source-connect) settings. |

### "Missing port in address"

**Symptoms:**

- **Save & test** fails immediately with an error that mentions a missing port.

**Solutions:**

1. Confirm the **Host URL** includes both the host and the port, for example `localhost:5433`.
1. Don't include a scheme such as `http://` or `https://` in the **Host URL**.

## Authentication errors

These errors occur when the database credentials are invalid or lack the required permissions.

### "Password authentication failed"

**Symptoms:**

- **Save & test** fails with an authentication error.
- Queries fail with permission errors.

**Possible causes and solutions:**

| Cause | Solution |
|-------|----------|
| Incorrect username or password | Verify the **Username** and re-enter the **Password** on the configuration page, then click **Save & test**. |
| User lacks database access | Grant the database user permission to connect to the target database and read the required tables. |
| Wrong database | Confirm the **Database** setting matches a database the user can access. |

## Query errors

These errors occur when you run a query against the data source.

### "No data" or empty results

**Symptoms:**

- A query runs without error but returns no data.
- Panels show a **No data** message.

**Possible causes and solutions:**

| Cause | Solution |
|-------|----------|
| Time range doesn't contain data | Expand the dashboard time range, or verify that data exists for that range. |
| Time filter excludes rows | Confirm the column passed to `$__timeFilter()` is the correct timestamp column. |
| Wrong table or column | Verify the table and column names against your schema. Names are case-sensitive when quoted. |

### Query timeout or slow queries

**Symptoms:**

- A query runs for a long time and then fails.
- Panels are slow to load.

**Solutions:**

1. Narrow the dashboard time range to reduce the amount of data scanned.
1. Add `WHERE` filters to reduce the result set.
1. Add indexes in YugabyteDB for the columns used in filters and time ranges.
1. Use `date_trunc()` to aggregate rows into time buckets instead of returning raw rows. The `$__timeGroup()` macro isn't compatible with YugabyteDB.

### Results don't render as a time series

**Symptoms:**

- A time-series panel shows the data as a table or fails to plot values.

**Solutions:**

1. Set the query **Format** to **Time series**.
1. Return a time-ordered column of `time` or `timestamp` type, aliased `AS time`.
1. Return at least one numeric column, and sort the results by the time column in ascending order.

### Timestamps appear shifted

**Symptoms:**

- Time-series values appear offset from the expected time by a fixed number of hours.
- Annotations or events display at different times than they occurred.

The data source reads `timestamp` columns, which don't carry time zone information, as UTC. If your application stores local wall-clock times in `timestamp` columns, Grafana treats those values as UTC and displays them shifted by your time zone offset.

**Solutions:**

1. Store timestamps in UTC, or use the `timestamptz` type so values include time zone information.
1. Convert local timestamps in the query, for example `created_at AT TIME ZONE 'America/New_York' AS time`.
1. Confirm the dashboard time zone in the time range options is set to the zone you expect.

## Template variable errors

These errors occur when you use template variables with the data source.

### Variables return no values

**Solutions:**

1. Verify the data source connection by running **Save & test** on the configuration page.
1. Confirm the variable query returns at least one column. Refer to [Query return format](https://grafana.com/docs/plugins/grafana-yugabyte-datasource/latest/template-variables/#query-return-format).
1. For chained variables, confirm that parent variables have valid selections.

### Multi-value variables don't match rows

**Symptoms:**

- A query that uses a multi-value variable with `IN` returns no rows.

**Solutions:**

1. Confirm you use the variable with the `IN` operator and without extra quotes, for example `status IN ($status)`.
1. Remember that multi-value variables expand to a single-quoted list, so they're intended for string columns. For numeric columns, cast the column or use string comparisons.

## Private data source connect issues

These issues occur when you query a YugabyteDB instance through Private data source connect (PDC) on Grafana Cloud.

### The Secure Socks Proxy toggle isn't visible

**Symptoms:**

- The **Additional Settings** section on the configuration page is empty.
- You can't find a PDC or **Secure Socks Proxy Enabled** option.

**Solutions:**

1. Confirm the secure socks proxy is enabled for your Grafana instance. The toggle only appears when it's enabled.
1. On Grafana Cloud, confirm that [Private data source connect](https://grafana.com/docs/grafana-cloud/connect-externally-hosted/private-data-source-connect/) is set up for your stack.
1. On self-managed Grafana, enable the secure socks proxy in the Grafana configuration file, then restart Grafana. Refer to [Configure the Yugabyte data source](https://grafana.com/docs/plugins/grafana-yugabyte-datasource/latest/configure/#private-data-source-connect).

### Connection fails only when a PDC network is selected

**Solutions:**

1. Confirm that [Private data source connect](https://grafana.com/docs/grafana-cloud/connect-externally-hosted/private-data-source-connect/) is set up and the PDC agent is running.
1. Verify the PDC agent can reach the YugabyteDB host and port on the private network.
1. Because host name resolution happens on the PDC side, confirm the host name resolves from the network where the PDC agent runs.

## Enable debug logging

To capture detailed error information for troubleshooting:

1. Set the Grafana log level to `debug` in the configuration file:

   ```ini
   [log]
   level = debug
   ```

1. Review the Grafana server logs and look for entries from the `grafana-yugabyte-datasource` plugin that include request and response details.
1. Reset the log level to `info` after troubleshooting to avoid excessive log volume.

## Get additional help

If you've tried the solutions in this document and still encounter issues:

1. Check the [Grafana community forums](https://community.grafana.com/) for similar issues.
1. Review the [Yugabyte data source plugin issues on GitHub](https://github.com/grafana/yugabyte-datasource/issues) for known bugs, and open an issue if needed.
1. Consult the [YugabyteDB documentation](https://docs.yugabyte.com/) for database-specific guidance.
1. When you report an issue, include:
   - Your Grafana version and plugin version.
   - The error message, with sensitive information redacted.
   - Steps to reproduce.
   - Relevant configuration, with credentials redacted.
