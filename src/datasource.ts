import { DataSourceInstanceSettings } from '@grafana/data';
import { DataSourceWithBackend } from '@grafana/runtime';
import { YugabyteQuery, YugabyteOptions } from './types';

export class DataSource extends DataSourceWithBackend<YugabyteQuery, YugabyteOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<YugabyteOptions>) {
    super(instanceSettings);
  }
}
