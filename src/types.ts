import { SQLOptions, SQLQuery } from '@grafana/plugin-ui';

/**
 * Represents a query specific to the Yugabyte data source.
 */
export interface YugabyteQuery extends SQLQuery {}

/**
 * These are options configured for each DataSource instance
 */
export interface YugabyteOptions extends SQLOptions {
  enableSecureSocksProxy?: boolean;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface YugabyteSecureJsonData {
  password?: string;
}
