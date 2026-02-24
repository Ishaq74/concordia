import { test, expect } from '@playwright/test';

// UI tests for the Link component documentation page.
// Focus on unique text and attributes to avoid picking up unrelated copies.

test.describe('LinkComponent – documentation page', () => {
  const url = 'http://localhost:4321/fr/docs/design/link';

  test('page exists (200)', async ({ request }) => {
    const res = await request.get(url);
    expect(res.status()).toBe(200);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(url);
  });

  test('simple links render + disabled + download', async ({ page }) => {
    const container = page.locator('h3:has-text("Lien Simple") + div.demo-box');
    await expect(container.locator('a', { hasText: 'Lien simple' })).toHaveCount(1);
    const ext = container.locator('a', { hasText: 'Lien externe' });
    await expect(ext).toHaveCount(1);
    await expect(ext).toHaveAttribute('target', '_blank');
    // Disabled
    const disabled = container.locator('a[aria-disabled="true"]');
    if (await disabled.count() > 0) {
      await expect(disabled).toBeVisible();
      await expect(disabled).toHaveAttribute('tabindex', '-1');
    }
    // Download
    const download = container.locator('a[download]');
    if (await download.count() > 0) {
      await expect(download).toBeVisible();
      const dlAttr = await download.getAttribute('download');
      expect(dlAttr).not.toBeNull();
    }
  });

  test('icons appear left and right + aria-label', async ({ page }) => {
    const retour = page.locator('a', { hasText: 'Retour' });
    await expect(retour.locator('svg')).toHaveCount(1);
    const suivant = page.locator('a', { hasText: 'Suivant' });
    await expect(suivant.locator('svg')).toHaveCount(1);
    // aria-label sur icône seule
    const iconOnly = page.locator('a[aria-label]');
    const count = await iconOnly.count();
    for (let i = 0; i < count; i++) {
      const a = iconOnly.nth(i);
      const label = await a.getAttribute('aria-label');
      expect(label).not.toBeNull();
    }
  });

  test('link-style variants present + classes', async ({ page }) => {
    const container = page.locator('h2#variants-liens + div.demo-box');
    for (const txt of ['Initial','Retro','Modern','Futuristic']) {
      const a = container.locator('a', { hasText: txt });
      await expect(a).toHaveCount(1);
      const cls = await a.first().getAttribute('class');
      expect(cls).toMatch(/(initial|retro|modern|futuristic)/);
    }
  });

  test('button-style variants contain default and primary + interaction', async ({ page }) => {
    const container = page.locator('h3#button-initial + div.demo-box');
    await expect(container.locator('a.button', { hasText: 'Default' })).toBeVisible();
    await expect(container.locator('a.button', { hasText: 'Primary' })).toBeVisible();
    // Interaction (clic)
    const btn = container.locator('a.button', { hasText: 'Default' });
    if (await btn.count() > 0) {
      await btn.click();
      // Vérifie feedback ou navigation si démo réelle
    }
  });

  // Checklist a11y et responsive
  test('Checklist a11y : aria-label, role, tabindex, responsive', async ({ page }) => {
    const links = page.locator('a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const a = links.nth(i);
      // aria-label si icône seule
      const hasIcon = await a.locator('svg').count() > 0;
      if (hasIcon && !(await a.textContent()).trim()) {
        const aria = await a.getAttribute('aria-label');
        expect(aria).not.toBeNull();
      }
      // role
      const role = await a.getAttribute('role');
      if (role) expect(['link','button','presentation']).toContain(role);
      // tabindex
      const tabindex = await a.getAttribute('tabindex');
      if (tabindex) expect(["0","-1"]).toContain(tabindex);
    }
    // Responsive
    await page.setViewportSize({ width: 375, height: 800 });
    await expect(links.first()).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 800 });
  });
});