import { CustomVariableSupport, DataQueryRequest, DataQueryResponse } from '@grafana/data';
import { VariableQueryEditor } from 'components/VariableQueryEditor';
import { YugabyteDataSource } from 'datasource';
import { uniqueId } from 'lodash';
import { Observable } from 'rxjs';
import { YugabyteQuery } from 'types';

export class YugabyteVariableSupport extends CustomVariableSupport<YugabyteDataSource> {
  datasource: YugabyteDataSource;
  editor = VariableQueryEditor;

  constructor(datasource: YugabyteDataSource) {
    super();
    this.datasource = datasource;
  }

  query(request: DataQueryRequest<YugabyteQuery>): Observable<DataQueryResponse> {
    const queries = request.targets.map((query) => {
      return { ...query, refId: query.refId || uniqueId('tempVar') };
    });
    return this.datasource.query({ ...request, targets: queries });
  }
}
