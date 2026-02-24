import { test, expect } from '@playwright/test';

// Smoke test for dialog documentation page.  Because the dialog uses a CSS-only
// checkbox hack, we avoid trying to open it and simply assert that triggers
// and labelled content exist in the DOM.

test.describe('DialogComponent – documentation page', () => {
  const url = 'http://localhost:4321/fr/docs/design/dialog';

  test('page exists (200)', async ({ request }) => {
    const res = await request.get(url);
    expect(res.status()).toBe(200);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(url);
  });

  test('basic trigger button renders', async ({ page }) => {
    const section = page.locator('h2#basic + div.demo-section');
    await expect(section.locator('button', { hasText: 'Ouvrir Dialog' })).toHaveCount(1);
    // the hidden dialog title should be present but not necessarily visible
    await expect(section.locator('text=Dialog Basique')).toHaveCount(1);
  });

  test('variant buttons exist for all four styles', async ({ page }) => {
    const variants = ['Initial', 'Retro', 'Modern', 'Futuristic'];
    for (const variant of variants) {
      const btn = page.locator('button', { hasText: variant });
      await expect(btn).toHaveCount(1);
    }
  });
});