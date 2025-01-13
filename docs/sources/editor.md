---
title: Query editor
description: This document describes the Yugabyte query editor
weight: 30
hero:
  title: Query editor
  description: This document describes the Yugabyte query editor.
  level: 1
---

{{< docs/hero-simple key="hero" >}}

In Grafana, querying data from your Yugabyte database can be accomplished through two primary methods: the **query builder** and the **raw query editor**.

## Query builder

The query builder provides a visual interface for constructing queries. It simplifies the process by allowing users to select tables, specify rows, and apply filters using an intuitive graphical interface. This is particularly useful for users who prefer a more guided approach and are less familiar with SQL syntax.
![Yugabyte Query Builder](/media/docs/yugabyte/yugabyte_explore_builder.png)

## Raw query editor

For users seeking more advanced querying capabilities or those with a deeper understanding of SQL, the raw query editor offers the flexibility to directly write SQL queries. This allows users to create complex queries that may not be supported by the query builder. The raw query editor also provides syntax highlighting and error checking to help users write queries more efficiently.
![Yugabyte Code Editor](/media/docs/yugabyte/yugabyte_explore_code.png)
