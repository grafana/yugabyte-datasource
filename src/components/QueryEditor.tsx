import React from 'react';
import { QueryEditorProps } from '@grafana/data';
import { YugabyteDataSource } from '../datasource';
import { YugabyteOptions, YugabyteQuery } from '../types';
import { SqlDatasource, SqlQueryEditor } from '@grafana/plugin-ui';

type Props = QueryEditorProps<YugabyteDataSource, YugabyteQuery, YugabyteOptions>;

export function QueryEditor(props: Props) {
  return <SqlQueryEditor {...props} datasource={props.datasource as unknown as SqlDatasource}  />;
}
