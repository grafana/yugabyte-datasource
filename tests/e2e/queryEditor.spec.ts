/// <reference types="node" />
import { expect, test, type ExplorePage } from '@grafana/plugin-e2e';
import { type Page, type Response } from '@playwright/test';

const PLUGIN_TYPE = 'grafana-yugabyte-datasource';
const PROVISIONING_FILE = 'datasources.yml';
const PROVISIONED_NAME = '✅ yugabyte (valid)';

// GRAFANA_URL is set only by the Cloud cron workflow. Its presence indicates the
// local provisioning file is not applied.
const isCloudRun = !!process.env.GRAFANA_URL;

const CLOUD_DEFAULT_UID = 'yugabyte-ds-m';

/**
 * Fixture time range. These must match the seed in `tests/e2e/fixtures/seed.sql`
 * (generated with `seed=42`, 30-minute interval).
 *
 * Cloud runs query a live `world_data` table, so they use a relative window.
 */
const FIXTURE_FROM_ISO = '2026-03-17T21:00:00.000Z';
const FIXTURE_TO_ISO = '2026-03-18T01:00:00.000Z';

// @grafana/plugin-ui QueryFormat is a numeric enum: Timeseries=0, Table=1.
type QueryOverrides = {
  rawSql?: string;
  editorMode?: 'builder' | 'code';
  format?: 0 | 1;
};

function exploreRange() {
  if (isCloudRun) {
    return { from: 'now-7d', to: 'now' };
  }
  return { from: FIXTURE_FROM_ISO, to: FIXTURE_TO_ISO };
}

function exploreUrl(uid: string, opts: QueryOverrides = {}): string {
  const query: Record<string, unknown> = {
    refId: 'A',
    datasource: { type: PLUGIN_TYPE, uid },
    format: opts.format ?? 1,
    rawSql: opts.rawSql ?? '',
    editorMode: opts.editorMode ?? 'code',
    ...(opts.rawSql ? { rawQuery: true } : {}),
  };
  const panes = JSON.stringify({
    explore: {
      datasource: uid,
      queries: [query],
      range: exploreRange(),
    },
  });
  return `/explore?orgId=1&schemaVersion=1&panes=${encodeURIComponent(panes)}`;
}

async function provisionedUid(
  readProvisionedDataSource: (opts: { fileName: string; name?: string }) => Promise<{ uid: string }>
): Promise<string> {
  if (isCloudRun) {
    return process.env.DS_E2E_UID || CLOUD_DEFAULT_UID;
  }
  const ds = await readProvisionedDataSource({
    fileName: PROVISIONING_FILE,
    name: PROVISIONED_NAME,
  });
  return ds.uid;
}

/**
 * Switch the query editor to a specific mode.
 *
 * Code → Builder opens a "Warning" dialog. Accept by clicking
 * "Discard code and switch" when it appears.
 *
 * Builder → Code does not trigger a dialog.
 */
async function switchMode(page: Page, mode: 'Builder' | 'Code') {
  const target = page.getByRole('radio', { name: mode, exact: true });
  if (await target.isChecked()) {
    return;
  }
  await target.click();
  if (mode === 'Builder') {
    const discardButton = page.getByRole('button', { name: 'Discard code and switch' });
    if (await discardButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await discardButton.click();
    }
  }
  await expect(target).toBeChecked();
}

// TODO: remove once @grafana/plugin-e2e exposes body reading natively.
function waitForQueryDataResponseWithBody(explorePage: ExplorePage) {
  let body: Record<string, unknown> | null = null;
  const responsePromise = explorePage.waitForQueryDataResponse(async (r: Response) => {
    if (!r.ok()) {
      return false;
    }
    const b = (await r.json().catch(() => null)) as Record<string, unknown> | null;
    const frames = (b as { results?: { A?: { frames?: unknown[] } } })?.results?.A?.frames;
    if (!Array.isArray(frames)) {
      return false;
    }
    body = b;
    return true;
  });
  return { responsePromise, getBody: () => body };
}

test.describe('Query editor', () => {
  test.describe('rendering', () => {
    test(
      'smoke: renders Builder and Code mode radios',
      { tag: '@plugins' },
      async ({ page, readProvisionedDataSource }) => {
        const uid = await provisionedUid(readProvisionedDataSource);
        await page.goto(exploreUrl(uid));

        await expect(page.getByRole('radio', { name: 'Builder', exact: true })).toBeVisible();
        await expect(page.getByRole('radio', { name: 'Code', exact: true })).toBeVisible();
      }
    );

    test('renders the Format combobox across modes', async ({ page, readProvisionedDataSource }) => {
      const uid = await provisionedUid(readProvisionedDataSource);
      await page.goto(exploreUrl(uid, { editorMode: 'code' }));
      await expect(page.getByRole('combobox', { name: /Format/ })).toBeVisible();
      await switchMode(page, 'Builder');
      await expect(page.getByRole('combobox', { name: /Format/ })).toBeVisible();
    });
  });

  test.describe('Code mode', () => {
    test('shows the SQL editor and Format query button', async ({ page, readProvisionedDataSource }) => {
      const uid = await provisionedUid(readProvisionedDataSource);
      await page.goto(exploreUrl(uid, { editorMode: 'code' }));
      await switchMode(page, 'Code');
      await expect(page.getByRole('textbox', { name: /editor content/i })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Format query' })).toBeVisible();
    });

    test('restores the SQL query from the URL', async ({ page, readProvisionedDataSource }) => {
      const uid = await provisionedUid(readProvisionedDataSource);
      await page.goto(exploreUrl(uid, { editorMode: 'code', rawSql: 'SELECT 1' }));
      await switchMode(page, 'Code');
      await expect(page.getByRole('textbox', { name: /editor content/i })).toHaveValue('SELECT 1');
    });
  });

  test.describe('Builder mode', () => {
    test('shows Table selector and Filter/Group/Order toggles', async ({
      page,
      readProvisionedDataSource,
    }) => {
      const uid = await provisionedUid(readProvisionedDataSource);
      await page.goto(exploreUrl(uid, { editorMode: 'builder' }));
      await switchMode(page, 'Builder');

      // Yugabyte queries a single configured database, so there is no Dataset selector.
      await expect(page.getByRole('combobox', { name: 'Table selector' })).toBeVisible();
      await expect(page.getByRole('combobox', { name: 'Column' })).toBeVisible();
      await expect(page.getByRole('switch', { name: /Filter/ })).toBeVisible();
      await expect(page.getByRole('switch', { name: /Group/ })).toBeVisible();
      await expect(page.getByRole('switch', { name: /Order/ })).toBeVisible();
    });
  });
});

test.describe('Query editor with fixture data', () => {
  test.describe.configure({ mode: 'serial' });

  test.describe('world_data', () => {
    test('code mode: SELECT returns rows', async ({ page, explorePage, readProvisionedDataSource }) => {
      const uid = await provisionedUid(readProvisionedDataSource);
      const { responsePromise, getBody } = waitForQueryDataResponseWithBody(explorePage);
      await page.goto(
        exploreUrl(uid, {
          editorMode: 'code',
          rawSql: 'SELECT base_country, birth_rate, co2, gdp, date_time, timestamp_value FROM world_data LIMIT 5',
        })
      );
      await responsePromise;

      const body = getBody() as {
        results?: { A?: { error?: string; frames?: Array<{ data?: { values?: unknown[][] } }> } };
      } | null;
      expect(body?.results?.A?.error).toBeUndefined();
      expect(body?.results?.A?.frames?.length).toBeGreaterThan(0);
      const firstColumn = body?.results?.A?.frames?.[0]?.data?.values?.[0];
      expect(firstColumn?.length).toBeGreaterThan(0);
      expect(firstColumn?.length).toBeLessThanOrEqual(5);
    });

    test('code mode: filter returns results', async ({ page, explorePage, readProvisionedDataSource }) => {
      const uid = await provisionedUid(readProvisionedDataSource);
      const { responsePromise, getBody } = waitForQueryDataResponseWithBody(explorePage);
      await page.goto(
        exploreUrl(uid, {
          editorMode: 'code',
          rawSql: "SELECT base_country, birth_rate FROM world_data WHERE base_country = 'Canada' LIMIT 5",
        })
      );
      await responsePromise;

      const body = getBody() as {
        results?: { A?: { error?: string; frames?: unknown[] } };
      } | null;
      expect(body?.results?.A?.error).toBeUndefined();
      expect(body?.results?.A?.frames?.length).toBeGreaterThan(0);
    });

    test('time_series format: aggregated co2 returns frames', async ({
      page,
      explorePage,
      readProvisionedDataSource,
    }) => {
      const uid = await provisionedUid(readProvisionedDataSource);
      const { responsePromise, getBody } = waitForQueryDataResponseWithBody(explorePage);
      await page.goto(
        exploreUrl(uid, {
          editorMode: 'code',
          format: 0,
          rawSql:
            'SELECT date_time AS time, AVG(co2) AS value FROM world_data GROUP BY date_time ORDER BY date_time LIMIT 50',
        })
      );
      await responsePromise;

      const body = getBody() as {
        results?: { A?: { error?: string; frames?: unknown[] } };
      } | null;
      expect(body?.results?.A?.error).toBeUndefined();
      expect(body?.results?.A?.frames?.length).toBeGreaterThan(0);
    });
  });
});
