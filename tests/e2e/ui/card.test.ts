import { test, expect } from '@playwright/test';

// Minimal smoke tests for the Card documentation page, keyed on unique text
// from each example so we don't accidentally grab unrelated cards later.

test.describe('CardComponent – documentation page', () => {
  const url = 'http://localhost:4321/fr/docs/design/card';

  test('page exists (200)', async ({ request }) => {
    const r = await request.get(url);
    expect(r.status()).toBe(200);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(url);
  });

  test('basic card shows title and description', async ({ page }) => {
    await expect(page.locator('h3', { hasText: 'Titre de la carte' })).toBeVisible();
    await expect(page.locator('div.card-content', { hasText: 'Une description simple' })).toBeVisible();
  });

  test('image card has "Workspace moderne" head', async ({ page }) => {
    await expect(page.locator('h3', { hasText: 'Workspace moderne' })).toBeVisible();
    await expect(page.locator('img[alt="Developer workspace"]')).toHaveCount(1);
  });

  test('full card contains Analytics Dashboard header', async ({ page }) => {
    await expect(page.locator('h3', { hasText: 'Analytics Dashboard' })).toBeVisible();
  });


});