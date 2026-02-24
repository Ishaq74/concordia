import { test, expect } from '@playwright/test';

test.describe('KbdComponent – documentation page (couverture totale)', () => {
  const url = 'http://localhost:4321/fr/docs/design/kbd';

  test('page existe (200)', async ({ request }) => {
    const res = await request.get(url);
    expect(res.status()).toBe(200);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(url);
  });

  // Démo rapide : touches simples et symboles
  test('Démo rapide : touches simples et symboles', async ({ page }) => {
    const section = page.locator('h2:has-text("Démo rapide") + div.demo-section');
    const keys = [
      'Ctrl', 'K', 'Esc', '⌘', 'Enter', 'Tab', 'Shift', 'Space', '⌫', '↑', '↓', '←', '→'
    ];
    for (const key of keys) {
      await expect(section.locator('kbd', { hasText: key })).toBeVisible();
    }
  });

  // Tailles
  test('Kbd : tailles sm, md, lg', async ({ page }) => {
    const sizes = ['sm', 'md', 'lg'];
    for (const size of sizes) {
      const kbd = page.locator(`.kbd.kbd-${size}`);
      await expect(kbd.first()).toBeVisible();
    }
  });

  // Raccourcis clavier (séquences)
  test('Kbd : séquences et combinaisons', async ({ page }) => {
    const shortcuts = [
      ['Ctrl', 'K'],
      ['Ctrl', 'S'],
      ['Ctrl', 'N'],
      ['Ctrl', 'A'],
      ['Ctrl', 'C'],
      ['Ctrl', 'V'],
      ['⌘', 'K'],
    ];
    for (const combo of shortcuts) {
      for (const key of combo) {
        await expect(page.locator('kbd', { hasText: key })).toBeVisible();
      }
    }
  });

  // Symboles et touches spéciales
  test('Kbd : symboles et touches spéciales', async ({ page }) => {
    const symbols = ['⌘', '⌥', '⌃', '⇧', '⌫', '⏎', '⎋', '⇥', '↑', '↓', '←', '→', '⇞', '⇟', '↖', '↘', 'Space', 'Enter', 'Backspace', 'Del', 'Esc', 'Tab', 'Caps'];
    for (const sym of symbols) {
      await expect(page.locator('kbd', { hasText: sym })).toBeVisible();
    }
  });

  // Variants
  test('Kbd : variants (initial, retro, modern, futuristic)', async ({ page }) => {
    const variants = ['initial', 'retro', 'modern', 'futuristic'];
    for (const variant of variants) {
      // Le variant "initial" n'a pas de classe spécifique
      if (variant === 'initial') {
        await expect(page.locator('kbd.kbd')).toBeVisible();
      } else {
        await expect(page.locator(`kbd.kbd-${variant}`)).toBeVisible();
      }
    }
  });

  // Couleurs
  test('Kbd : couleurs (default, primary, secondary, accent)', async ({ page }) => {
    const colors = ['primary', 'secondary', 'accent'];
    for (const color of colors) {
      await expect(page.locator(`kbd.${color}`)).toBeVisible();
    }
    // default : pas de classe color
    await expect(page.locator('kbd.kbd')).toBeVisible();
  });

  // Variants + couleurs combinés
  test('Kbd : variants + couleurs combinés', async ({ page }) => {
    await expect(page.locator('kbd.kbd-retro.primary')).toBeVisible();
    await expect(page.locator('kbd.kbd-modern.secondary')).toBeVisible();
    await expect(page.locator('kbd.kbd-futuristic.accent')).toBeVisible();
  });

  // Props et structure
  test('Kbd : props et structure HTML', async ({ page }) => {
    const kbd = page.locator('kbd.kbd');
    expect(await kbd.count()).toBeGreaterThan(0);
    for (let i = 0; i < await kbd.count(); i++) {
      const el = kbd.nth(i);
      await expect(el).toBeVisible();
      // balise kbd
      expect(await el.evaluate(e => e.tagName)).toBe('KBD');
      // slot : texte visible
      expect(await el.textContent()).not.toBe('');
    }
  });

  // Exemples d’utilisation réels (doc)
  test('Kbd : exemples d’utilisation réels', async ({ page }) => {
    // Commandes éditeur
    await expect(page.locator('li:has(kbd:has-text("Ctrl"))')).toBeVisible();
    await expect(page.locator('li:has(kbd:has-text("D"))')).toBeVisible();
    await expect(page.locator('li:has(kbd:has-text("Shift"))')).toBeVisible();
    // Formulaire
    await expect(page.locator('p:has(kbd:has-text("Enter"))')).toBeVisible();
    await expect(page.locator('p:has(kbd:has-text("Tab"))')).toBeVisible();
    // Recherche
    await expect(page.locator('div:has(h4:has-text("Recherche globale")) kbd')).toBeVisible();
  });

  // Accessibilité
  test('Kbd : accessibilité (balise, contraste, lisibilité)', async ({ page }) => {
    const kbd = page.locator('kbd.kbd');
    expect(await kbd.count()).toBeGreaterThan(0);
    for (let i = 0; i < await kbd.count(); i++) {
      const el = kbd.nth(i);
      // balise kbd
      expect(await el.evaluate(e => e.tagName)).toBe('KBD');
      // Contraste : couleur de fond et texte différents
      const bg = await el.evaluate(e => getComputedStyle(e).backgroundColor);
      const color = await el.evaluate(e => getComputedStyle(e).color);
      expect(bg).not.toBe(color);
      // Lisibilité : taille de police >= 12px
      const fontSize = await el.evaluate(e => parseFloat(getComputedStyle(e).fontSize));
      expect(fontSize).toBeGreaterThanOrEqual(12);
    }
  });
});