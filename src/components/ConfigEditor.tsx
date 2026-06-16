import React, { SyntheticEvent } from 'react';
import { Field, Input, SecretInput } from '@grafana/ui';
import {
  DataSourcePluginOptionsEditorProps,
  onUpdateDatasourceJsonDataOption,
  onUpdateDatasourceSecureJsonDataOption,
  updateDatasourcePluginResetOption,
} from '@grafana/data';
import { YugabyteOptions } from '../types';
import { ConfigSection, DataSourceDescription, SecureSocksProxyToggle } from '@grafana/plugin-ui';

interface Props extends DataSourcePluginOptionsEditorProps<YugabyteOptions> {}

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;
  const ELEMENT_WIDTH = 40;

  // BUG: when delete "url" value and save, it will reset to the previous value??
  const onDSOptionChanged = (property: keyof YugabyteOptions) => {
    return (event: SyntheticEvent<HTMLInputElement>) => {
      onOptionsChange({ ...options, ...{ [property]: event.currentTarget.value } });
    };
  };

  const onResetPassword = () => {
    updateDatasourcePluginResetOption(props, 'password');
  };

  return (
    <>
      <DataSourceDescription
        dataSourceName="Yugabyte"
        docsLink="https://grafana.com/docs/grafana/latest/datasources/yugabyte/"
        hasRequiredFields={true}
      />

      <hr />

      <ConfigSection title="Connection">
        <Field label="Host URL" required>
          <Input
            width={ELEMENT_WIDTH}
            placeholder="localhost:5433"
            value={options.url || ''}
            onChange={onDSOptionChanged('url')}
          />
        </Field>

        <Field label="Database" required>
          <Input
            width={ELEMENT_WIDTH}
            placeholder="yb_demo"
            value={options.jsonData.database || ''}
            onChange={onUpdateDatasourceJsonDataOption(props, 'database')}
          />
        </Field>
      </ConfigSection>

      <hr />

      <ConfigSection title="Authentication">
        <Field label="Username" required>
          <Input
            width={ELEMENT_WIDTH}
            placeholder="yugabyte"
            value={options.user || ''}
            onChange={onDSOptionChanged('user')}
          />
        </Field>

        <Field label="Password">
          <SecretInput
            width={ELEMENT_WIDTH}
            placeholder="********"
            isConfigured={options.secureJsonFields && options.secureJsonFields.password}
            onReset={onResetPassword}
            onBlur={onUpdateDatasourceSecureJsonDataOption(props, 'password')}
          />
        </Field>
      </ConfigSection>

      <ConfigSection title="Additional Settings" isCollapsible>
        <SecureSocksProxyToggle labelWidth={30} dataSourceConfig={options} onChange={onOptionsChange} />
      </ConfigSection>
    </>
  );
}
