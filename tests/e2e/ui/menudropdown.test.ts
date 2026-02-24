import { test, expect } from '@playwright/test';

// MenuDropdown page has simple variant examples and a title. We verify the
// header and at least one menu item text.

test.describe('MenuDropdown – documentation page', () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, 'mobile behaviour not needed');
  });
  const url = 'http://localhost:4321/fr/docs/design/menudropdown';

  test('page loads and initial items shown', async ({ request, page }) => {
    const r = await request.get(url);
    expect(r.status()).toBe(200);
    await page.goto(url);
    await expect(page.locator('h1', { hasText: 'MenuDropdown' })).toBeVisible();
    await expect(page.locator('text=Un')).toHaveCount(1);
  });
});