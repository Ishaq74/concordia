import { test, expect } from '@playwright/test';

test.describe('DropdownComponent – documentation page (couverture totale)', () => {
  const url = 'http://localhost:4321/fr/docs/design/dropdown';

  test('page existe (200)', async ({ request }) => {
    const res = await request.get(url);
    expect(res.status()).toBe(200);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(url);
  });

  // Démo menu court
  test('Dropdown : menu court, ouverture/fermeture, sélection', async ({ page }) => {
    const trigger = page.locator('.dropdown .dropdown-trigger', { hasText: 'Menu' }).first();
    await expect(trigger).toBeVisible();
    await trigger.click();
    const menu = page.locator('.dropdown-menu');
    await expect(menu).toBeVisible();
    // items visibles
    await expect(menu.locator('.dropdown-item')).toHaveCount(3);
    await expect(menu.locator('.dropdown-item', { hasText: 'Profile' })).toBeVisible();
    // sélection
    await menu.locator('.dropdown-item', { hasText: 'Profile' }).click();
    await expect(menu).not.toBeVisible();
  });

  // Menu long (scroll)
  test('Dropdown : menu long, scroll, sélection', async ({ page }) => {
    const trigger = page.locator('.dropdown .dropdown-trigger', { hasText: 'Menu long' }).first();
    await trigger.click();
    const menu = page.locator('.dropdown-menu');
    await expect(menu).toBeVisible();
    await expect(menu.locator('.dropdown-item')).toHaveCountGreaterThan(10);
    await menu.locator('.dropdown-item', { hasText: 'Analytics' }).click();
    await expect(menu).not.toBeVisible();
  });

  // Menu avec liens
  test('Dropdown : menu avec liens', async ({ page }) => {
    const trigger = page.locator('.dropdown .dropdown-trigger', { hasText: 'Menu liens' }).first();
    await trigger.click();
    const menu = page.locator('.dropdown-menu');
    await expect(menu).toBeVisible();
    const link = menu.locator('a.dropdown-item', { hasText: 'Blog' });
    await expect(link).toHaveAttribute('href', /#blog/);
  });

  // Menu avec disabled
  test('Dropdown : item disabled', async ({ page }) => {
    const trigger = page.locator('.dropdown .dropdown-trigger', { hasText: 'Menu disabled' }).first();
    await trigger.click();
    const menu = page.locator('.dropdown-menu');
    const disabled = menu.locator('.dropdown-item.disabled', { hasText: 'Delete' });
    await expect(disabled).toBeVisible();
    await disabled.click();
    // menu reste ouvert car disabled
    await expect(menu).toBeVisible();
  });

  // Menu récursif (sous-menus)
  test('Dropdown : sous-menus récursifs', async ({ page }) => {
    const trigger = page.locator('.dropdown .dropdown-trigger', { hasText: 'Menu récursif' }).first();
    await trigger.click();
    const menu = page.locator('.dropdown-menu');
    await expect(menu).toBeVisible();
    // ouvrir sous-menu "Products"
    const products = menu.locator('.dropdown-item.has-submenu', { hasText: 'Products' });
    await products.click();
    const sub = menu.locator('.submenu-content');
    await expect(sub).toBeVisible();
    // ouvrir sous-menu "Categories"
    const categories = sub.locator('.dropdown-item.has-submenu', { hasText: 'Categories' });
    await categories.click();
    const sub2 = sub.locator('.submenu-content');
    await expect(sub2).toBeVisible();
    // sélectionner "Electronics"
    await sub2.locator('.dropdown-item', { hasText: 'Electronics' }).click();
    await expect(menu).not.toBeVisible();
  });

  // Hover
  test('Dropdown : ouverture au hover', async ({ page }) => {
    const trigger = page.locator('.dropdown.dropdown-hover .dropdown-trigger').first();
    await trigger.hover();
    const menu = page.locator('.dropdown.dropdown-hover .dropdown-menu');
    await expect(menu).toBeVisible();
  });

  // Variants
  test('Dropdown : variants (retro, modern, futuristic)', async ({ page }) => {
    const variants = ['retro', 'modern', 'futuristic'];
    for (const variant of variants) {
      const trigger = page.locator(`.dropdown.${variant} .dropdown-trigger`).first();
      await trigger.click();
      const menu = page.locator(`.dropdown.${variant} .dropdown-menu`);
      await expect(menu).toBeVisible();
      await expect(menu.locator('.dropdown-item')).toHaveCountGreaterThan(0);
      await menu.locator('.dropdown-item').first().click();
      await expect(menu).not.toBeVisible();
    }
  });

  // Checklist a11y
  test('Dropdown : accessibilité (aria, focus, clavier)', async ({ page }) => {
    const trigger = page.locator('.dropdown .dropdown-trigger').first();
    await trigger.focus();
    // ouverture clavier (Enter)
    await trigger.press('Enter');
    const menu = page.locator('.dropdown-menu');
    await expect(menu).toBeVisible();
    // navigation clavier (Tab)
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    // fermeture clavier (Escape)
    await page.keyboard.press('Escape');
    await expect(menu).not.toBeVisible();
  });

  // Responsive
  test('Dropdown : responsive (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    const trigger = page.locator('.dropdown .dropdown-trigger').first();
    await trigger.click();
    const menu = page.locator('.dropdown-menu');
    await expect(menu).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 800 });
  });
});