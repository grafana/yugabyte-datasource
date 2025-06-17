import React, { SyntheticEvent } from 'react';
import { Field, Input, SecretInput, Switch, useTheme2 } from '@grafana/ui';
import {
  DataSourcePluginOptionsEditorProps,
  onUpdateDatasourceJsonDataOption,
  onUpdateDatasourceSecureJsonDataOption,
  updateDatasourcePluginResetOption,
  GrafanaTheme2,
} from '@grafana/data';
import { YugabyteOptions } from '../types';
import { ConfigSection, DataSourceDescription } from '@grafana/plugin-ui';
import { config } from '@grafana/runtime';
import { css } from '@emotion/css';

interface Props extends DataSourcePluginOptionsEditorProps<YugabyteOptions> {}

const getStyles = (theme: GrafanaTheme2) => ({
  toggle: css`
    margin-top: 7px;
    margin-left: 5px;
  `,
  infoText: css`
    padding-bottom: ${theme.spacing(1)};
    color: ${theme.colors.text.secondary};
  `,
});

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;
  const ELEMENT_WIDTH = 40;
  const theme = useTheme2();
  const styles = getStyles(theme);

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
        {config.secureSocksDSProxyEnabled && (
          <>
            <div className="gf-form-group">
              <h3 className="page-heading">Secure Socks Proxy</h3>
              <div className={styles.infoText}>
                Enable proxying the datasource connection through the secure socks proxy to a different network. See{' '}
                <a
                  href="https://grafana.com/docs/grafana/next/setup-grafana/configure-grafana/proxy/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Configure a data source connection proxy.
                </a>
              </div>
              <Field label="Enable">
                <div className={styles.toggle}>
                  <Switch
                    value={options.jsonData.enableSecureSocksProxy}
                    onChange={(e) => {
                      onOptionsChange({
                        ...options,
                        jsonData: {
                          ...options.jsonData,
                          enableSecureSocksProxy: e.currentTarget.checked,
                        },
                      });
                    }}
                  />
                </div>
              </Field>
            </div>
          </>
        )}
      </ConfigSection>
    </>
  );
}
