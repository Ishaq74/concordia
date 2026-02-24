import { test, expect } from '@playwright/test';

// Sheet page has a trigger button; assert its existence.

test.describe('SheetComponent – documentation page', () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, 'sheet interactions may differ');
  });
  const url = 'http://localhost:4321/fr/docs/design/sheet';

  test('page loads and open trigger is visible', async ({ request, page }) => {
    const r = await request.get(url);
    expect(r.status()).toBe(200);
    await page.goto(url);
    await expect(page.locator('text=Ouvrir le Sheet')).toHaveCount(1);
  });
});