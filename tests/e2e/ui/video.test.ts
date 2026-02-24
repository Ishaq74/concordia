import { test, expect } from '@playwright/test';

// Video page simply embeds a <video> element; check its presence and src attr.

test.describe('VideoComponent – documentation page', () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, 'player differences on mobile');
  });
  const url = 'http://localhost:4321/fr/docs/design/video';

  test('page loads and video tag exists', async ({ request, page }) => {
    const r = await request.get(url);
    expect(r.status()).toBe(200);
    await page.goto(url);
    const video = page.locator('video');
    await expect(video).toHaveCount(1);
    await expect(video).toHaveAttribute('src', /BigBuckBunny/);
  });
});