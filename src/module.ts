import { DataSourcePlugin } from '@grafana/data';
import { YugabyteDataSource } from './datasource';
import { ConfigEditor } from './components/ConfigEditor';
import { QueryEditor } from './components/QueryEditor';
import { YugabyteQuery, YugabyteOptions } from './types';

export const plugin = new DataSourcePlugin<YugabyteDataSource, YugabyteQuery, YugabyteOptions>(YugabyteDataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
