import React, { useCallback } from 'react';
import { SQLEditor } from '@grafana/plugin-ui';
import { YugabyteDataSource } from 'datasource';
import { YugabyteOptions, YugabyteQuery } from 'types';
import { QueryEditorProps } from '@grafana/data';

type Props = QueryEditorProps<YugabyteDataSource, YugabyteQuery, YugabyteOptions>;

export function VariableQueryEditor({ datasource, onChange, query }: Props) {
  const onQueryChange = useCallback(
    (rawSql: string) => onChange({ ...query, rawQuery: true, rawSql }),
    [onChange, query]
  );

  return (
    <SQLEditor
      query={query.rawSql!}
      onChange={onQueryChange}
      language={{ id: 'sql', completionProvider: datasource.getSqlCompletionProvider(datasource.db) }}
    />
  );
}
