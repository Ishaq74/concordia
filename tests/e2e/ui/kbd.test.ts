import { test, expect } from '@playwright/test';

// UI smoke tests for the Kbd documentation page
// We don't need a lot of detail because the component is very simple,
// but we still scope to a section to avoid false positives.

test.describe('KbdComponent – documentation page', () => {
  const url = 'http://localhost:4321/fr/docs/design/kbd';

  test('page exists (200)', async ({ request }) => {
    const res = await request.get(url);
    expect(res.status()).toBe(200);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(url);
  });

  test('renders at least one keyboard key', async ({ page }) => {
    // demo section contains several <kbd> tags
    const section = page.locator('h2:has-text("Démo rapide") + div.demo-section');
    const count = await section.locator('kbd').count();
    expect(count).toBeGreaterThan(0);
    // ensure a known key exists exactly once
    await expect(section.locator('kbd', { hasText: 'Ctrl' })).toHaveCount(1);
  });
});