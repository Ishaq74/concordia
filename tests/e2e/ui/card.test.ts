import { test, expect } from '@playwright/test';

test.describe('CardComponent – documentation page (couverture totale)', () => {
  const url = 'http://localhost:4321/fr/docs/design/card';

  test('page existe (200)', async ({ request }) => {
    const r = await request.get(url);
    expect(r.status()).toBe(200);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(url);
  });

  // Card : tous les variants et elevations
  test('Card : variants, elevation, interactive, classes', async ({ page }) => {
    const variants = ['initial', 'retro', 'modern', 'futuristic'];
    const elevations = ['none', 'sm', 'md', 'lg', 'xl'];
    for (const variant of variants) {
      for (const elevation of elevations) {
        const card = page.locator(`.card.card-${variant}.elevation-${elevation}`);
        if (await card.count() > 0) {
          await expect(card.first()).toBeVisible();
          const cls = await card.first().getAttribute('class');
          expect(cls).toMatch(new RegExp(variant));
          expect(cls).toMatch(new RegExp(elevation));
        }
      }
    }
    // interactive
    const interactive = page.locator('.card.interactive');
    if (await interactive.count() > 0) {
      await expect(interactive.first()).toBeVisible();
    }
  });

  // CardHeader
  test('CardHeader : structure, slot', async ({ page }) => {
    const headers = page.locator('.card-header');
    const count = await headers.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const header = headers.nth(i);
      await expect(header).toBeVisible();
      await expect(header.locator('slot, *')).toBeVisible();
    }
  });

  // CardFooter
  test('CardFooter : align, slot', async ({ page }) => {
    const footers = page.locator('.card-footer');
    const count = await footers.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const footer = footers.nth(i);
      await expect(footer).toBeVisible();
      const cls = await footer.getAttribute('class');
      expect(cls).toMatch(/align-(left|center|right|between)/);
      await expect(footer.locator('slot, *')).toBeVisible();
    }
  });

  // CardContent
  test('CardContent : slot, structure', async ({ page }) => {
    const contents = page.locator('.card-content');
    const count = await contents.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const content = contents.nth(i);
      await expect(content).toBeVisible();
      await expect(content.locator('slot, *')).toBeVisible();
    }
  });

  // CardMeta
  test('CardMeta : items, icônes, labels', async ({ page }) => {
    const metas = page.locator('.card-meta');
    const count = await metas.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const meta = metas.nth(i);
      await expect(meta).toBeVisible();
      // items list
      const items = meta.locator('.card-meta-item');
      if (await items.count() > 0) {
        for (let j = 0; j < await items.count(); j++) {
          const item = items.nth(j);
          await expect(item.locator('.card-meta-text')).toBeVisible();
          // icône optionnelle
          const icon = item.locator('.card-meta-icon');
          if (await icon.count() > 0) await expect(icon).toBeVisible();
          // label optionnel
          const label = item.locator('.card-meta-label');
          if (await label.count() > 0) await expect(label).toBeVisible();
        }
      }
    }
  });

  // CardImage
  test('CardImage : src, alt, aspect, fit', async ({ page }) => {
    const images = page.locator('.card-image');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      await expect(img).toBeVisible();
      const src = await img.getAttribute('src');
      expect(src).not.toBeNull();
      const alt = await img.getAttribute('alt');
      expect(alt).not.toBeNull();
      const cls = await img.getAttribute('class');
      expect(cls).toMatch(/object-(cover|contain|fill|none)/);
    }
  });

  // CardDescription
  test('CardDescription : texte, truncate, lignes', async ({ page }) => {
    const descs = page.locator('.card-description');
    const count = await descs.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const desc = descs.nth(i);
      await expect(desc).toBeVisible();
      const cls = await desc.getAttribute('class');
      if (cls.includes('truncate')) {
        expect(cls).toMatch(/truncate-\d+/);
      }
      await expect(desc.locator('slot, *')).toBeVisible();
    }
  });





  test('basic card shows title, description, structure', async ({ page }) => {
    const section = page.locator('h3:has-text("Titre de la carte")').first();
    await expect(section).toBeVisible();
    const card = section.locator('..').locator('.card');
    await expect(card).toBeVisible();
    await expect(card.locator('.card-title')).toHaveText(/Titre de la carte/);
    await expect(card.locator('.card-content')).toHaveText(/Une description simple/);
    await expect(card.locator('.card-footer')).toHaveCount(1);
  });

  test('image card : header, image, alt, actions', async ({ page }) => {
    const section = page.locator('h3:has-text("Workspace moderne")').first();
    await expect(section).toBeVisible();
    const card = section.locator('..').locator('.card');
    await expect(card.locator('img[alt="Developer workspace"]')).toHaveCount(1);
    await expect(card.locator('.card-header')).toBeVisible();
    await expect(card.locator('.card-actions')).toBeVisible();
  });

  test('full card : Analytics Dashboard, structure, interaction', async ({ page }) => {
    const section = page.locator('h3:has-text("Analytics Dashboard")').first();
    await expect(section).toBeVisible();
    const card = section.locator('..').locator('.card');
    await expect(card.locator('.card-title')).toHaveText(/Analytics Dashboard/);
    await expect(card.locator('.card-content')).toBeVisible();
    // Interaction : bouton d’action
    const btn = card.locator('button');
    if (await btn.count() > 0) {
      await btn.first().click();
      // Vérifie feedback ou changement d’état si démo réelle
    }
  });

  test('cards variants, props, classes', async ({ page }) => {
    const variants = ['initial', 'retro', 'modern', 'futuristic'];
    for (const variant of variants) {
      const card = page.locator(`.card.${variant}`);
      if (await card.count() > 0) {
        await expect(card.first()).toBeVisible();
        const cls = await card.first().getAttribute('class');
        expect(cls).toMatch(new RegExp(variant));
      }
    }
  });

  test('cards with href, aria-label, interactive', async ({ page }) => {
    const cards = page.locator('.card[href]');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      await expect(card).toBeVisible();
      const href = await card.getAttribute('href');
      expect(href).not.toBeNull();
      const aria = await card.getAttribute('aria-label');
      if (aria) expect(aria.length).toBeGreaterThan(0);
    }
  });

  // Checklist a11y et responsive
  test('Checklist a11y : role, aria, tabindex, responsive', async ({ page }) => {
    const cards = page.locator('.card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      // role
      const role = await card.getAttribute('role');
      if (role) expect(['region','presentation','link','button']).toContain(role);
      // aria-label
      const aria = await card.getAttribute('aria-label');
      if (aria) expect(aria.length).toBeGreaterThan(0);
      // tabindex
      const tabindex = await card.getAttribute('tabindex');
      if (tabindex) expect(["0","-1"]).toContain(tabindex);
    }
    // Responsive
    await page.setViewportSize({ width: 375, height: 800 });
    await expect(cards.first()).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 800 });
  });


});