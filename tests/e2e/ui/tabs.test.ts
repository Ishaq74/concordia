import { test, expect } from '@playwright/test';

// Tabs page has an interactive demo; we simply check that the welcome header
// is present (with emoji) inside that demo section.

test.describe('TabsComponent – documentation page', () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, 'demo text duplicates on mobile');
  });
  const url = 'http://localhost:4321/fr/docs/design/tabs';

  test('page loads and demo heading present', async ({ request, page }) => {
    const res = await request.get(url);
    expect(res.status()).toBe(200);
    await page.goto(url);
    const demo = page.locator('div.demo-section');
    await expect(demo.locator('h3', { hasText: 'Bienvenue dans la démo Tabs' })).toHaveCount(1);
  });
});