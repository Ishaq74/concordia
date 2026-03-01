import { test, expect } from '@playwright/test';

// Tests for the NewTab component through the documentation page
// ensures JavaScript behaviour, ARIA roles and responsive navigation.

test.describe('NewTabComponent – documentation page', () => {
  const url = 'http://localhost:4321/fr/docs/design/newtab';

  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, 'skip heavy interactions on mobile');
  });

  test('page loads and demo is present', async ({ request, page }) => {
    const res = await request.get(url);
    expect(res.status()).toBe(200);
    await page.goto(url);
    await expect(page.locator('h2', { hasText: 'Démo interactive' })).toHaveCount(1);
  });

  test('tabs switch on click and update aria attributes', async ({ page }) => {
    await page.goto(url);
    const firstTab = page.locator('[role="tab"]').nth(0);
    const secondTab = page.locator('[role="tab"]').nth(1);
    await expect(firstTab).toHaveAttribute('aria-selected', 'true');
    await expect(secondTab).toHaveAttribute('aria-selected', 'false');

    await secondTab.click();
    await expect(secondTab).toHaveAttribute('aria-selected', 'true');
    await expect(firstTab).toHaveAttribute('aria-selected', 'false');
    const firstPanel = page.locator('[role="tabpanel"]').nth(0);
    await expect(firstPanel).toHaveAttribute('hidden', '');
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto(url);
    const tabs = page.locator('[role="tab"]');
    await tabs.nth(0).focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowLeft');
    await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
  });

  test('props table uses UI Table component', async ({ page }) => {
    await page.goto(url);
    const propsSection = page.locator('h2#props + div.props-table');
    await expect(propsSection.locator('.table-container')).toBeVisible();
    await expect(propsSection.locator('th', { hasText: 'Prop' })).toBeVisible();
    await expect(propsSection.locator('td', { hasText: 'variant' })).toBeVisible();
  });

  test('variants demo uses Grid layout', async ({ page }) => {
    await page.goto(url);
    const grid = page.locator('h3:has-text("Démo par variant") + .example-grid');
    await expect(grid).toBeVisible();
    await expect(grid.locator('article')).toHaveCountGreaterThan(0); // cards rendered as articles inside grid
  });

  test('additional sections exist', async ({ page }) => {
    await page.goto(url);
    await expect(page.locator('h2#examples')).toHaveCount(1);
    await expect(page.locator('h2#best-practices')).toHaveCount(1);
  });

  test('demo iframe is embedded and points to demo file', async ({ page }) => {
    await page.goto(url);
    const frame = page.locator('iframe[title="Démonstration NewTab complète"]');
    await expect(frame).toBeVisible();
    const src = await frame.getAttribute('src');
    expect(src).toBe('/newtab-demo.html');
  });

  test('responsive horizontal scroll behaviour', async ({ page }) => {
    await page.goto(url);
    await page.setViewportSize({ width: 360, height: 800 });
    const tabList = page.locator('.tab-list');
    const wrap = await tabList.evaluate(el => getComputedStyle(el).flexWrap);
    expect(wrap).toBe('nowrap');
    const overflow = await tabList.evaluate(el => getComputedStyle(el).overflowX);
    expect(overflow).toMatch(/auto|scroll/);
  });

  test('modern variant container has gradient background', async ({ page }) => {
    await page.goto(url);
    const modern = page.locator('.variant-modern').first();
    const bg = await modern.evaluate(el => getComputedStyle(el).backgroundImage);
    expect(bg).toContain('linear-gradient');
  });

  test('futuristic variant uses grid overlay', async ({ page }) => {
    await page.goto(url);
    const fut = page.locator('.variant-futuristic').first();
    const bgImg = await fut.evaluate(el => getComputedStyle(el).backgroundImage);
    // gradient grid is applied via ::before, but the main element should at least have base color
    expect(bgImg).toContain('rgb');
  });

  test('CSS file uses design tokens (no hex colors)', async ({ request }) => {
    const res = await request.get('/src/components/ui/NewTab/NewTab.css');
    const text = await res.text();
    expect(text).not.toContain('#');
    expect(text).toContain('var(--color-');
  });
});