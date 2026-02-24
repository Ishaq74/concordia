import { test, expect } from '@playwright/test';

// Code page has several <pre> blocks; we simply verify the headings and
// presence of JavaScript snippet to ensure the page rendered the examples.

test.describe('CodeComponent – documentation page', () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, 'skip mobile, not needed');
  });
  const url = 'http://localhost:4321/fr/docs/design/code';

  test('page exists and basic usage example shown', async ({ request, page }) => {
    const res = await request.get(url);
    expect(res.status()).toBe(200);
    await page.goto(url);
    // basic usage heading
    await expect(page.locator('h3#basic-usage')).toBeVisible();
    // first <pre> should contain the greet function
    await expect(page.locator('pre').first()).toContainText('function greet(name)');
  });
});