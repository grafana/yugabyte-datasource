import { test, expect } from '@grafana/plugin-e2e';

test('Smoke test: plugin loads', async ({ createDataSourceConfigPage, page }) => {
  await createDataSourceConfigPage({ type: 'grafana-yugabyte-datasource' });

  // Grafana >=13.1 removed the "Type: <Plugin>" subtitle; fall back to the Connection heading as the page-load gate.
  // .first() guards against builds where multiple alternatives are present simultaneously (strict-mode violation).
  await expect(
    page
      .getByText('Type: Yugabyte', { exact: true })
      .or(page.getByText(/^Type\s*Yugabyte$/))
      .or(page.getByRole('heading', { name: 'Connection', exact: true }))
      .first()
  ).toBeVisible({ timeout: 30_000 });
  await expect(await page.getByRole('heading', { name: 'Connection', exact: true })).toBeVisible();
});
