import { test, expect } from '@playwright/test';

// UI tests for Badge documentation. Uses plain text lookups so that
// both desktop and mobile renderings are handled identically.

test.describe('BadgeComponent – Page de documentation complète', () => {
  const url = 'http://localhost:4321/fr/docs/design/badge';

  test('page exists (200)', async ({ request }) => {
    const res = await request.get(url);
    expect(res.status()).toBe(200);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(url);
  });

  test('Badges simples', async ({ page }) => {
    const badges = page.locator('h3:has-text("Badges simples") + div.demo-box span.badge');
    await expect(badges).toHaveCount(3);
    await expect(badges.nth(0)).toHaveText(/Nouveau/);
    await expect(badges.nth(1)).toHaveText(/Beta/);
    await expect(badges.nth(2)).toHaveText(/v2\.0/);
  });

  test('Exemples avec slot', async ({ page }) => {
    const badges = page.locator('h3:has-text("Avec slot") + div.demo-box span.badge');
    await expect(badges).toHaveCount(3);
    await expect(badges.nth(0)).toHaveText(/Custom Text/);
    await expect(badges.nth(1)).toHaveText(/🎉 Promo/);
    await expect(badges.nth(2)).toHaveText(/^\s*3\s*$/);
  });

  test('Couleurs initiales', async ({ page }) => {
    const badges = page.locator('h3#initial-colors + div.demo-box span.badge');
    await expect(badges).toHaveCount(4);
    const texts = ['Default','Primary','Secondary','Accent'];
    for (let i = 0; i < texts.length; i++) {
      await expect(badges.nth(i)).toHaveText(new RegExp(texts[i]));
    }
  });

  test('Icones gauche et droite', async ({ page }) => {
    const val = page.locator('span.badge', { hasText: 'Validé' });
    await expect(val).toHaveCount(1);
    await expect(val.locator('svg')).toHaveCount(1);

    const dl = page.locator('span.badge', { hasText: 'Télécharger' });
    await expect(dl).toHaveCount(1);
    await expect(dl.locator('svg')).toHaveCount(1);
  });

  test('Dismissible badges', async ({ page }) => {
    for (const txt of ['Nouveau','Promo -20%','Notification']) {
      const b = page.locator('span.badge', { hasText: txt });
      await expect(b.locator('button')).toHaveCount(1);
    }
  });

  test('Compteurs et statuts', async ({ page }) => {
    const counters = page.locator('h3#compteurs + div.demo-box span.badge');
    await expect(counters).toHaveCount(2);
    await expect(counters.nth(0)).toHaveText(/3/);
    await expect(counters.nth(1)).toHaveText(/12/);

    const statuses = page.locator('h3#statuts + div.demo-box span.badge');
    await expect(statuses).toHaveCount(3);
    await expect(statuses.nth(0)).toContainText(/En ligne/);
    await expect(statuses.nth(1)).toContainText(/Hors ligne/);
    await expect(statuses.nth(2)).toContainText(/Occupé/);
  });

  test('Tags modernes', async ({ page }) => {
    const badges = page.locator('h3#tags + div.demo-box span.badge');
    await expect(badges).toHaveCount(6);
    const labels = ['JavaScript','TypeScript','React','Astro','CSS','HTML'];
    for (let i=0;i<labels.length;i++) await expect(badges.nth(i)).toHaveText(new RegExp(labels[i]));
  });

  test('Versions', async ({ page }) => {
    const badges = page.locator('h3#versions + div.demo-box span.badge');
    await expect(badges).toHaveCount(4);
    const texts = ['v1.0.0','v2.0.0','Beta','Alpha'];
    for (let i=0;i<texts.length;i++) await expect(badges.nth(i)).toHaveText(new RegExp(texts[i]));
  });

  test('Combinaisons variants + couleurs', async ({ page }) => {
    const combos = page.locator('h2#combinaisons + div.demo-box span.badge');
    await expect(combos).toHaveCount(16);
  });
});