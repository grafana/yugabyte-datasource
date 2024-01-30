import { DataSourceJsonData } from '@grafana/data';
import { DataQuery } from '@grafana/schema';

export interface YugabyteQuery extends DataQuery {
  queryType: 'YSQL' | 'YCQL';
  rawSql: string;
}

/**
 * These are options configured for each DataSource instance
 */
export interface YugabyteOptions extends DataSourceJsonData {
  url: string;
  user: string;
  database: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface YugabyteSecureJsonData {
  password?: string;
}
