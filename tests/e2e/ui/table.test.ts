import { test, expect } from '@playwright/test';

// Table docs include several appearances of the word "Clavier"; limit to the
// demo-section to avoid counts from code examples later.

test.describe('TableComponent – documentation page', () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, 'demo has duplicates on mobile');
  });
  const url = 'http://localhost:4321/fr/docs/design/table';

  test('page loads and demo table caption shows', async ({ request, page }) => {
    const res = await request.get(url);
    expect(res.status()).toBe(200);
    await page.goto(url);
    const demo = page.locator('div.demo-section');
    await expect(demo.locator('text=Liste des utilisateurs récents')).toHaveCount(1);
    await expect(demo.locator('text=Clavier')).toHaveCount(1);
    await expect(demo.locator('text=John Doe')).toHaveCount(1);
  });
});