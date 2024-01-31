import React, { useCallback, useEffect } from 'react';
import { QueryEditorProps } from '@grafana/data';
import { SQLEditor } from '@grafana/experimental';
import { DataSource } from '../datasource';
import { YugabyteOptions, YugabyteQuery } from '../types';

type Props = QueryEditorProps<DataSource, YugabyteQuery, YugabyteOptions>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {
  useEffect(() => console.log(query), [query]);

  const onRawQueryChange = useCallback(
    (rawSql: string, _: boolean) => {
      if (rawSql === query.rawSql) {
        return;
      }

      onChange({ ...query, queryType: 'YSQL', rawSql: rawSql });
    },
    [query, onChange]
  );

  return <SQLEditor query={query.rawSql} onChange={onRawQueryChange} />;
}
