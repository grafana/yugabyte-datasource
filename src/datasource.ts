import { DataFrame, DataFrameView, DataSourceInstanceSettings, ScopedVars, TimeRange } from '@grafana/data';
import {
  BackendDataSourceResponse,
  DataSourceWithBackend,
  FetchResponse,
  getBackendSrv,
  toDataQueryResponse,
} from '@grafana/runtime';
import { DB, QueryFormat, SQLSelectableValue, ValidationResults, LanguageCompletionProvider } from '@grafana/plugin-ui';
import { DataQuery } from '@grafana/schema';
import { lastValueFrom, map } from 'rxjs';
import { YugabyteQuery, YugabyteOptions } from 'types';
import { buildColumnQuery, buildTableQuery } from './utils/queries';
import { completionFetchColumns, completionFetchTables, getCompletionProvider } from './utils/completion';
import { AGGREGATE_FNS } from './utils/constants';
import { YugabyteVariableSupport } from 'variables';
import { replace } from 'utils/variables';

export class YugabyteDataSource extends DataSourceWithBackend<YugabyteQuery, YugabyteOptions> {
  annotations = {};
  db: DB;
  dataset: string;
  completionProvider: LanguageCompletionProvider | undefined;

  constructor(private instanceSettings: DataSourceInstanceSettings<YugabyteOptions>) {
    super(instanceSettings);
    this.db = this.getDB();
    this.dataset = this.instanceSettings.jsonData.database;
    this.variables = new YugabyteVariableSupport(this);
  }

  /**
   * Applies template variables to the given YugabyteQuery object.
   * Replaces any occurrences of template variables in the raw SQL string with their corresponding values.
   */
  applyTemplateVariables(query: YugabyteQuery, scopedVars: ScopedVars): YugabyteQuery {
    const sql = replace(query.rawSql ?? '', scopedVars) ?? '';
    return { ...query, rawSql: sql };
  }

  /**
   * Filters the query based on the provided YugabyteQuery object.
   * Returns true if the query contains raw SQL, false otherwise.
   */
  filterQuery(query: YugabyteQuery): boolean {
    return Boolean(query.rawSql);
  }

  /**
   * Validates a Yugabyte query.
   * Returns a ValidationResults object.
   */
  validateQuery(query: YugabyteQuery): ValidationResults {
    return { query, isError: false, isValid: true, error: '' };
  }

  /**
   * Executes a SQL query and returns the result as a DataFrameView.
   * Used for running meta queries to fetch table and column names.
   */
  async runSql<T extends object>(query: string, options?: RunSQLOptions): Promise<DataFrameView<T>> {
    const frame = await this.runMetaQuery(
      {
        rawSql: query,
        format: QueryFormat.Table,
        refId: options?.refId,
      },
      options
    );
    return new DataFrameView<T>(frame);
  }

  /**
   * Executes a meta query using the provided request object.
   * Returns the result as a DataFrame.
   */
  async runMetaQuery(request: Partial<YugabyteQuery>, options?: MetricFindQueryOptions): Promise<DataFrame> {
    const refId = request.refId || 'meta';
    const queries: DataQuery[] = [{ ...request, datasource: request.datasource || this.getRef(), refId }];
    return lastValueFrom(
      getBackendSrv()
        .fetch<BackendDataSourceResponse>({
          url: '/api/ds/query',
          method: 'POST',
          data: {
            from: options?.range?.from.valueOf().toString(),
            to: options?.range?.to.valueOf().toString(),
            queries,
          },
          requestId: refId,
        })
        .pipe(
          map((res: FetchResponse<BackendDataSourceResponse>) => {
            const rsp = toDataQueryResponse(res, queries);
            return rsp.data[0];
          })
        )
    );
  }

  /**
   * Fetches the tables from the specified database.
   * Database is set through the datasource config page.
   */
  async fetchTables(): Promise<string[]> {
    const tables = await this.runSql<any>(buildTableQuery(), { refId: `tables` });
    return tables.map((f) => f[0]);
  }

  /**
   * Fetches the fields for a given Yugabyte query.
   * If no table is provided, it returns an empty array.
   */
  async fetchFields(query: Partial<YugabyteQuery>): Promise<SQLSelectableValue[]> {
    if (!this.dataset || !query.table) {
      return [];
    }
    const fields = await this.runSql<any>(buildColumnQuery(query.table), { refId: 'fields' });
    return fields.map((f) => ({ name: f[0], text: f[0], value: f[0], type: f[1], label: f[0] }));
  }

  /**
   * Returns the DB object for the datasource.
   * The DB object provides methods for interacting with the datasource.
   */
  getDB(): DB {
    if (this.db !== undefined) {
      return this.db;
    }
    return {
      dsID: () => this.id,
      lookup: () => Promise.resolve([]),
      datasets: () => Promise.resolve([]),
      functions: async () => Promise.resolve(AGGREGATE_FNS),
      tables: async () => await this.fetchTables(),
      fields: async (query: YugabyteQuery) => await this.fetchFields(query),
      validateQuery: async (query: YugabyteQuery) => this.validateQuery(query),
      getSqlCompletionProvider: () => this.getSqlCompletionProvider(this.db),
      disableDatasets: true,
    };
  }

  /**
   * Retrieves the SQL completion provider associated with the data source.
   * If the provider is not already initialized, it will be created and returned.
   */
  getSqlCompletionProvider(db: DB): LanguageCompletionProvider {
    if (this.completionProvider !== undefined) {
      return this.completionProvider;
    }
    const args = {
      getColumns: { current: (query: YugabyteQuery) => completionFetchColumns(db, query) },
      getTables: { current: () => completionFetchTables(db) },
    };
    this.completionProvider = getCompletionProvider(args);
    return this.completionProvider;
  }
}

interface RunSQLOptions extends MetricFindQueryOptions {
  refId?: string;
}

interface MetricFindQueryOptions extends SearchFilterOptions {
  range?: TimeRange;
}

interface SearchFilterOptions {
  searchFilter?: string;
}
