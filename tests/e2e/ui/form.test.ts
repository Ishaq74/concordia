import { test, expect } from '@playwright/test';

// Form documentation contains four variant cards in an example grid. We scope
// the search within that grid to avoid duplicates from other sections.

test.describe('FormComponents – documentation page', () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, 'grid layout problematic on mobile');
  });
  const url = 'http://localhost:4321/fr/docs/design/form';

  test('page exists and variant cards appear', async ({ request, page }) => {
    const res = await request.get(url);
    expect(res.status()).toBe(200);
    await page.goto(url);
    const grid = page.locator('.example-grid');
    for (const title of ['Connexion', "Inscription", 'Contact', 'Paramètres']) {
      await expect(grid.locator('h4', { hasText: title })).toHaveCount(1);
    }
  });
});