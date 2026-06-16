---
title: Yugabyte data source
description: This document introduces the Yugabyte data source
weight: 10
hero:
  title: Yugabyte data source plugin
  description: The Yugabyte data source for Grafana allows you to query and visualize data from YugabyteDB.
  level: 1
---

{{< docs/hero-simple key="hero" >}}

{{< docs/public-preview product="Grafana **Yugabyte** data source plugin" >}}

## Requirements

The Yugabyte data source has the following requirements:

- A YugabyteDB instance (on-prem/cloud)

## Yugabyte data source plugin vs Postgres data source plugin

Opting for the Yugabyte data source over the PostgreSQL data source can provide several advantages, particularly when exclusively working with YugabyteDB clusters.
Unlike the Postgres data source, which is focused on PostgreSQL databases, the Yugabyte data source gives us the ability to implement Yugabyte-specific features and tailored query capabilities.

## Known limitations

- Grafana ad-hoc filters are not supported
- TLS / Network customization is not supported yet

## Compatibility requirements

- Grafana version >= 10.4.5
