import { test, expect } from '@playwright/test';

/**
 * E2E tests for blog flows — browsing, navigation, category filtering.
 */

test.describe('Blog — Navigation', () => {
  test('blog index page loads in French', async ({ page }) => {
    await page.goto('/fr/blog/');
    await expect(page.locator('main')).toBeVisible();
    await expect(page).toHaveTitle(/blog/i);
  });

  test('blog index page loads in English', async ({ page }) => {
    await page.goto('/en/blog/');
    await expect(page.locator('main')).toBeVisible();
  });

  test('blog index page loads in Arabic (RTL)', async ({ page }) => {
    await page.goto('/ar/blog/');
    await expect(page.locator('main')).toBeVisible();
    const dir = await page.locator('html').getAttribute('dir');
    expect(dir).toBe('rtl');
  });

  test('blog category page loads', async ({ page }) => {
    await page.goto('/fr/blog/');
    // Look for any category link on the blog page
    const categoryLinks = page.locator('a[href*="/blog/"]');
    const count = await categoryLinks.count();
    if (count > 0) {
      await categoryLinks.first().click();
      await expect(page.locator('main')).toBeVisible();
    }
  });
});

test.describe('Blog — Article Detail', () => {
  test('clicking a blog post shows article content', async ({ page }) => {
    await page.goto('/fr/blog/');
    const articleLinks = page.locator('article a, a[href*="/blog/"]');
    const count = await articleLinks.count();
    if (count > 0) {
      await articleLinks.first().click();
      await expect(page.locator('main')).toBeVisible();
      // Article should have heading content
      await expect(page.locator('h1')).toBeVisible();
    }
  });
});
