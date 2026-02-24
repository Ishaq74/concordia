import { test, expect } from '@playwright/test';

// Tooltip docs contain small interactive examples; we verify the trigger text
// and badge/button combinations to assert the examples rendered.

test.describe('TooltipComponent – documentation page', () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, 'not necessary on mobile');
  });
  const url = 'http://localhost:4321/fr/docs/design/tooltip';

  test('page loads and basic triggers display', async ({ request, page }) => {
    const r = await request.get(url);
    expect(r.status()).toBe(200);
    await page.goto(url);
    const demo = page.locator('div.example-section');
    await expect(demo.locator('text=Survolez-moi')).toHaveCount(1);
    await expect(demo.locator('text=Bouton avec tooltip')).toHaveCount(1);
    await expect(demo.locator('text=Statut actif')).toHaveCount(1);
  });
});