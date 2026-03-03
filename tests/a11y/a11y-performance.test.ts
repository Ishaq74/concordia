import { test, expect } from '@playwright/test';
import { runAxe } from './a11y-utils';

// Accessibility tests
test.describe('Accessibilité', () => {
  test('Axe-core: aucune violation critique sur toutes les pages', async ({ page }) => {
    const urls = ['/', '/fr/', '/en/', '/ar/', '/es/'];
    for (const url of urls) {
      await page.goto(url);
      const results = await runAxe(page);
      expect(results.violations.length).toBe(0);
    }
  });
});

// Performance tests — Lighthouse integration is not configured yet.
// TODO: Install and configure the `lighthouse` package to enable real scoring.
test.describe('Performance', () => {
  test.skip('Lighthouse: score > 90 sur toutes les pages (requires lighthouse config)', async () => {
    // Placeholder — see TODO in a11y-utils.ts
  });
});
