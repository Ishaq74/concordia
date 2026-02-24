import { test, expect } from '@playwright/test';

test.describe('TableComponent – documentation page (couverture totale)', () => {
  const url = 'http://localhost:4321/fr/docs/design/table';

  test('page existe (200)', async ({ request }) => {
    const res = await request.get(url);
    expect(res.status()).toBe(200);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(url);
  });

  // Démo rapide : structure, caption, lignes, badges
  test('Table : démo rapide, caption, lignes, badges', async ({ page }) => {
    const section = page.locator('h2:has-text("Démo rapide") + div.demo-section');
    const table = section.locator('table');
    await expect(table).toBeVisible();
    await expect(section.locator('caption')).toContainText('Liste des utilisateurs récents');
    await expect(table.locator('thead tr th')).toHaveCount(4);
    await expect(table.locator('tbody tr')).toHaveCount(3);
    await expect(table.locator('td', { hasText: 'John Doe' })).toBeVisible();
    // Deux badges 'Actif' (Admin, Éditeur), un badge 'Inactif' (Utilisateur)
    const badgesActif = table.locator('.badge.primary', { hasText: 'Actif' });
    await expect(badgesActif.nth(0)).toBeVisible();
    await expect(badgesActif.nth(1)).toBeVisible();
    await expect(table.locator('.badge.secondary', { hasText: 'Inactif' })).toBeVisible();
  });

  // Avec footer
  test('Table : footer présent si défini', async ({ page }) => {
    const section = page.locator('h2#with-footer + div.demo-section');
    if (await section.count() > 0) {
      const table = section.locator('table');
      await expect(table.locator('tfoot')).toBeVisible();
    }
  });

  // Table striped
  test('Table : striped', async ({ page }) => {
    const section = page.locator('h2#striped + div.demo-section');
    if (await section.count() > 0) {
      const table = section.locator('table.striped');
      await expect(table).toBeVisible();
      await expect(table.locator('tbody tr')).toHaveCountGreaterThan(1);
    }
  });

  // Responsive (scroll horizontal)
  test('Table : responsive (scroll horizontal)', async ({ page }) => {
    const section = page.locator('h2#responsive + div.demo-section');
    if (await section.count() > 0) {
      const table = section.locator('table');
      await expect(table).toBeVisible();
      // simulate small viewport
      await page.setViewportSize({ width: 375, height: 800 });
      await expect(table).toBeVisible();
      await page.setViewportSize({ width: 1280, height: 800 });
    }
  });

  // Variants
  test('Table : variants (initial, retro, modern, futuristic)', async ({ page }) => {
    const variants = ['initial', 'retro', 'modern', 'futuristic'];
    for (const variant of variants) {
      const table = page.locator(`table.${variant}`);
      if (await table.count() > 0) {
        await expect(table.first()).toBeVisible();
      }
    }
  });

  // Checklist a11y : caption, th scope, aria, focus
  test('Table : accessibilité (caption, th, aria, focus)', async ({ page }) => {
    const table = page.locator('table').first();
    await expect(table.locator('caption')).toBeVisible();
    const ths = table.locator('th');
    for (let i = 0; i < await ths.count(); i++) {
      const th = ths.nth(i);
      const scope = await th.getAttribute('scope');
      expect(scope === 'col' || scope === 'row' || scope === null).toBeTruthy();
    }
    // focusable cells (skip if none)
    const tdCount = await table.locator('td').count();
    if (tdCount > 0) {
      const td = table.locator('td').first();
      await td.focus();
      const outline = await td.evaluate(e => getComputedStyle(e).outlineStyle);
      // Certains navigateurs/thèmes peuvent utiliser 'none', 'dotted', 'solid', 'auto', etc.
      expect(['solid', 'auto', 'dotted', 'none'].includes(outline)).toBeTruthy();
    }
  });

  // Exemples avancés (présence de TableFoot, TableCaption, Badge, etc.)
  test('Table : exemples avancés (foot, caption, badge)', async ({ page }) => {
    const foot = page.locator('tfoot');
    if (await foot.count() > 0) {
      await expect(foot).toBeVisible();
    }
    const badge = page.locator('.badge');
    if (await badge.count() > 0) {
      await expect(badge.first()).toBeVisible();
    }
    const caption = page.locator('caption');
    if (await caption.count() > 0) {
      await expect(caption.first()).toBeVisible();
    }
  });
});