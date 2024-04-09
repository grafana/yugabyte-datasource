import { SQLExpression } from '@grafana/plugin-ui';
import { isEmpty } from 'lodash';
import { YugabyteQuery } from 'types';

export const toRawSql = ({ sql, table }: YugabyteQuery): string => {
  let query = '';
  if (!sql || !haveColumns(sql.columns)) {
    return query;
  }
  query += createSelectClause(sql.columns);
  if (table) {
    query += `FROM ${table} `;
  }
  if (sql.whereString) {
    query += `WHERE ${sql.whereString} `;
  }
  if (sql.groupBy?.[0]?.property.name) {
    const groupBy = sql.groupBy.map((g) => g.property.name).filter((g) => !isEmpty(g));
    query += `GROUP BY ${groupBy.join(', ')} `;
  }
  if (sql.orderBy?.property.name) {
    query += `ORDER BY ${sql.orderBy.property.name} `;
  }
  if (sql.orderBy?.property.name && sql.orderByDirection) {
    query += `${sql.orderByDirection} `;
  }
  if (sql.limit !== undefined && sql.limit >= 0) {
    query += `LIMIT ${sql.limit} `;
  }
  return query;
};

const haveColumns = (columns: SQLExpression['columns']): columns is NonNullable<SQLExpression['columns']> => {
  if (!columns) {
    return false;
  }
  const haveColumn = columns.some((c) => c.parameters?.length || c.parameters?.some((p) => p.name));
  const haveFunction = columns.some((c) => c.name);
  return haveColumn || haveFunction;
};

const createSelectClause = (sqlColumns: NonNullable<SQLExpression['columns']>): string => {
  const columns = sqlColumns.map((c) => {
    let rawColumn = '';
    if (c.name) {
      rawColumn += `${c.name}(${c.parameters?.map((p) => `${p.name}`)})`;
    } else {
      rawColumn += `${c.parameters?.map((p) => `${p.name}`)}`;
    }
    return rawColumn;
  });
  return `SELECT ${columns.join(', ')} `;
};
