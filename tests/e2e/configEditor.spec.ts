import { expect, test } from '@grafana/plugin-e2e';
import { type Page } from '@playwright/test';

import { type YugabyteOptions } from '../../src/types';

const PLUGIN_TYPE = 'grafana-yugabyte-datasource';
const PROVISIONING_FILE = 'datasources.yml';
const PROVISIONED_NAME = '✅ yugabyte (valid)';

// GRAFANA_URL is set only by the Cloud cron workflow (playwright-cloud). Local and PR CI
// don't set it, so its presence is a reliable signal that we're running against a shared
// Cloud instance where the local provisioning/datasources/datasources.yml is not applied.
const isCloudRun = !!process.env.GRAFANA_URL;

// Cloud-managed datasource uid follows `{resourceName}-ds-m` (infra/grafana/utils.ts).
const CLOUD_DEFAULT_UID = 'yugabyte-ds-m';

function instanceHostUrl(): string {
  if (process.env.DS_INSTANCE_URL) {
    return process.env.DS_INSTANCE_URL;
  }
  const host = process.env.DS_INSTANCE_HOST ?? 'yugabyte';
  const port = process.env.DS_INSTANCE_PORT ?? '5433';
  return host.includes(':') ? host : `${host}:${port}`;
}

const DS_USER = process.env.DS_INSTANCE_USERNAME ?? 'yugabyte';
const DS_PASSWORD = process.env.DS_INSTANCE_PASSWORD ?? 'yugabyte';
const DS_DATABASE = process.env.DS_INSTANCE_DATABASE ?? 'yugabyte';

async function configurePDC(page: Page, networkName: string) {
  const pdcCombobox = page.getByRole('combobox', { name: 'Private data source connect' });
  if (await pdcCombobox.isVisible({ timeout: 2000 }).catch(() => false)) {
    await pdcCombobox.click();
    await page.getByText(networkName).click();
  }
}

test.describe('Config editor', () => {
  test.describe('rendering', () => {
    test(
      'smoke: should render config editor',
      { tag: '@plugins' },
      async ({ createDataSourceConfigPage, page }) => {
        await createDataSourceConfigPage({ type: PLUGIN_TYPE });

        await expect(page.getByRole('heading', { name: 'Connection', exact: true })).toBeVisible();
        await expect(page.getByPlaceholder('localhost:5433')).toBeVisible();
      }
    );

    test('should render Connection section', async ({ createDataSourceConfigPage, page }) => {
      await createDataSourceConfigPage({ type: PLUGIN_TYPE });

      await expect(page.getByRole('heading', { name: 'Connection', exact: true })).toBeVisible();
      await expect(page.getByText(/Host URL/).first()).toBeVisible();
      await expect(page.getByPlaceholder('localhost:5433')).toBeVisible();
      await expect(page.getByText(/Database/).first()).toBeVisible();
      await expect(page.getByPlaceholder('yb_demo')).toBeVisible();
    });

    test('should render Authentication section', async ({ createDataSourceConfigPage, page }) => {
      await createDataSourceConfigPage({ type: PLUGIN_TYPE });

      const heading = page.getByRole('heading', { name: 'Authentication', exact: true });
      await heading.scrollIntoViewIfNeeded();
      await expect(heading).toBeVisible();
      await expect(page.getByPlaceholder('yugabyte')).toBeVisible();
      await expect(page.getByPlaceholder('********')).toBeVisible();
    });

    test('should render Additional Settings section', async ({ createDataSourceConfigPage, page }) => {
      await createDataSourceConfigPage({ type: PLUGIN_TYPE });

      await expect(page.getByRole('heading', { name: 'Additional Settings' })).toBeVisible();
    });
  });

  test.describe('provisioned datasource', () => {
    test.beforeEach(() => {
      test.skip(
        isCloudRun,
        'Provisioned-datasource tests assert values from the local provisioning YAML, which is not applied on the shared Cloud instance.'
      );
    });

    test('should load provisioned connection fields', async ({
      readProvisionedDataSource,
      gotoDataSourceConfigPage,
      page,
    }) => {
      const ds = await readProvisionedDataSource<YugabyteOptions>({
        fileName: PROVISIONING_FILE,
        name: PROVISIONED_NAME,
      });
      await gotoDataSourceConfigPage(ds.uid);

      await expect(page.getByPlaceholder('localhost:5433')).toHaveValue(ds.url);
      await expect(page.getByPlaceholder('yb_demo')).toHaveValue(ds.jsonData.database ?? '');
    });

    test('should load provisioned authentication fields', async ({
      readProvisionedDataSource,
      gotoDataSourceConfigPage,
      page,
    }) => {
      const ds = await readProvisionedDataSource<YugabyteOptions>({
        fileName: PROVISIONING_FILE,
        name: PROVISIONED_NAME,
      });
      await gotoDataSourceConfigPage(ds.uid);

      await expect(page.getByPlaceholder('yugabyte')).toHaveValue(ds.user ?? '');
      // Secure field renders a masked placeholder indicating it is set, not
      // the actual password value.
      await expect(page.getByPlaceholder('********')).toHaveValue('configured');
    });
  });

  test.describe('save & test', () => {
    test('should pass health check for provisioned datasource', async ({
      readProvisionedDataSource,
      gotoDataSourceConfigPage,
      page,
    }) => {
      const uid = isCloudRun
        ? process.env.DS_E2E_UID || CLOUD_DEFAULT_UID
        : (
            await readProvisionedDataSource<YugabyteOptions>({
              fileName: PROVISIONING_FILE,
              name: PROVISIONED_NAME,
            })
          ).uid;
      const configPage = await gotoDataSourceConfigPage(uid);

      // Match both `Save & test` (editable: true) and `Test` (editable: false)
      await page.getByRole('button', { name: /^(Save & test|Test)$/ }).click();
      await expect(configPage).toHaveAlert('success');
    });

    test('should show error alert when health check fails', async ({
      createDataSourceConfigPage,
      page,
    }) => {
      const configPage = await createDataSourceConfigPage({ type: PLUGIN_TYPE });

      await page.getByPlaceholder('localhost:5433').fill(instanceHostUrl());
      await page.getByPlaceholder('yb_demo').fill(DS_DATABASE);
      await page.getByPlaceholder('yugabyte').fill(DS_USER);
      await configPage.mockHealthCheckResponse({ status: 'ERROR', message: 'mocked failure' }, 400);

      await configPage.saveAndTest();
      await expect(configPage).toHaveAlert('error');
    });

    test('should show error alert when backend is unreachable', async ({
      createDataSourceConfigPage,
      page,
    }) => {
      const configPage = await createDataSourceConfigPage({ type: PLUGIN_TYPE });

      // `localhost` from inside the Grafana container never resolves to YugabyteDB
      await page.getByPlaceholder('localhost:5433').fill('localhost:5433');
      await page.getByPlaceholder('yb_demo').fill(DS_DATABASE);
      await page.getByPlaceholder('yugabyte').fill(DS_USER);
      await page.getByRole('button', { name: /^(Save & test|Test)$/ }).click();
      await expect(configPage).toHaveAlert('error');
    });

    test('valid credentials should display a success alert on the page', async ({
      createDataSourceConfigPage,
      page,
    }) => {
      test.skip(
        !process.env.CI && !process.env.DS_INSTANCE_HOST,
        'YugabyteDB must be reachable from inside Grafana; set DS_INSTANCE_HOST or run in CI'
      );
      test.skip(
        isCloudRun,
        'Ad-hoc save & test connectivity is not reliable on the shared Cloud instance; covered by the provisioned health check.'
      );

      const configPage = await createDataSourceConfigPage({ type: PLUGIN_TYPE });
      await page.getByPlaceholder('localhost:5433').fill(instanceHostUrl());
      await page.getByPlaceholder('yb_demo').fill(DS_DATABASE);
      await page.getByPlaceholder('yugabyte').fill(DS_USER);
      await page.getByPlaceholder('********').fill(DS_PASSWORD);

      if (process.env.DS_PDC_NETWORK_NAME) {
        await configurePDC(page, process.env.DS_PDC_NETWORK_NAME);
      }

      await configPage.saveAndTest();
      await expect(configPage).toHaveAlert('success', { hasNotText: 'Datasource updated' });
    });
  });
});
