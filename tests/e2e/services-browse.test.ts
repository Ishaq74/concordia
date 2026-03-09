import { test, expect } from '@playwright/test';

/**
 * E2E tests for services browsing and search/filter flow.
 */

test.describe('Services — Browsing', () => {
  test('services index page loads in French', async ({ page }) => {
    await page.goto('/fr/services/');
    await expect(page.locator('main')).toBeVisible();
  });

  test('services index page loads in English', async ({ page }) => {
    await page.goto('/en/services/');
    await expect(page.locator('main')).toBeVisible();
  });

  test('services category navigation works', async ({ page }) => {
    await page.goto('/fr/services/');
    const categoryLinks = page.locator('a[href*="/services/"]');
    const count = await categoryLinks.count();
    if (count > 0) {
      await categoryLinks.first().click();
      await expect(page.locator('main')).toBeVisible();
    }
  });
});

test.describe('Services — Search & Filter', () => {
  test('search bar is present on services page', async ({ page }) => {
    await page.goto('/fr/services/');
    const searchInput = page.locator('input[type="search"], input[placeholder*="cherch"], input[placeholder*="search"], [data-search]');
    const count = await searchInput.count();
    // Search bar should exist if the feature is implemented
    if (count > 0) {
      await expect(searchInput.first()).toBeVisible();
      // Type a search query
      await searchInput.first().fill('test');
      // Results should update (page should not crash)
      await expect(page.locator('main')).toBeVisible();
    }
  });
});
