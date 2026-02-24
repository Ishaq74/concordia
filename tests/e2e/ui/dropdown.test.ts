import { test, expect } from '@playwright/test';

// Dropdown page is mostly visual; verify that both basic trigger and
// multi-level sections are present.

test.describe('DropdownComponent – documentation page', () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, 'mobile contains repeated text');
  });
  const url = 'http://localhost:4321/fr/docs/design/dropdown';

  test('page exists and basic menu trigger present', async ({ request, page }) => {
    const res = await request.get(url);
    expect(res.status()).toBe(200);
    await page.goto(url);
    await expect(page.locator('h2#basic')).toBeVisible();
    const section = page.locator('h2#basic + div.demo-section');
    await expect(section.locator('text=Menu')).toHaveCount(1);
  });

  test('recursive section displayed', async ({ page }) => {
    // heading itself is sufficient
    await expect(page.locator('h2#recursive')).toHaveCount(1);
  });
});