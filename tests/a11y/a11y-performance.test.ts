import { test, expect } from '@playwright/test';
import { runLighthouse, runAxe } from './a11y-utils';

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

// Performance tests
test.describe('Performance', () => {
  test('Lighthouse: score > 90 sur toutes les pages', async () => {
    const urls = ['/', '/fr/', '/en/', '/ar/', '/es/'];
    for (const url of urls) {
      const report = await runLighthouse(url);
      expect(report.performance).toBeGreaterThan(90);
      expect(report.accessibility).toBeGreaterThan(90);
    }
  });
});
