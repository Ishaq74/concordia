import { test, expect } from '@playwright/test';

// UI tests for the Link component documentation page.
// Focus on unique text and attributes to avoid picking up unrelated copies.

test.describe('LinkComponent – documentation page', () => {
  const url = 'http://localhost:4321/fr/docs/design/link';

  test('page exists (200)', async ({ request }) => {
    const res = await request.get(url);
    expect(res.status()).toBe(200);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(url);
  });

  test('simple links render', async ({ page }) => {
    const container = page.locator('h3:has-text("Lien Simple") + div.demo-box');
    await expect(container.locator('a', { hasText: 'Lien simple' })).toHaveCount(1);
    const ext = container.locator('a', { hasText: 'Lien externe' });
    await expect(ext).toHaveCount(1);
    await expect(ext).toHaveAttribute('target', '_blank');
  });

  test('icons appear left and right', async ({ page }) => {
    const retour = page.locator('a', { hasText: 'Retour' });
    await expect(retour.locator('svg')).toHaveCount(1);
    const suivant = page.locator('a', { hasText: 'Suivant' });
    await expect(suivant.locator('svg')).toHaveCount(1);
  });

  test('link-style variants present', async ({ page }) => {
    const container = page.locator('h2#variants-liens + div.demo-box');
    for (const txt of ['Initial','Retro','Modern','Futuristic']) {
      await expect(container.locator('a', { hasText: txt })).toHaveCount(1);
    }
  });

  test('button-style variants contain default and primary', async ({ page }) => {
    // the initial button demo-box follows an <h3> with id button-initial
    const container = page.locator('h3#button-initial + div.demo-box');
    await expect(container.locator('a.button', { hasText: 'Default' })).toBeVisible();
    await expect(container.locator('a.button', { hasText: 'Primary' })).toBeVisible();
  });
});