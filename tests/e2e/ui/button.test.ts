import { test, expect } from '@playwright/test';

// UI tests for the Button documentation page using Playwright
// These assertions exercise the same examples that appear on the
// documentation page at /fr/docs/design/button (adapt the URL if needed).

test.describe('ButtonComponent – Page de documentation complète', () => {
  const url = 'http://localhost:4321/fr/docs/design/button';

  test('page de documentation existe (200)', async ({ request }) => {
    const res = await request.get(url);
    expect(res.status()).toBe(200);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(url);
  });

  // Section Variants
  test('Vérifie tous les variants et couleurs (boutons)', async ({ page }) => {
    const variants = ['initial', 'retro', 'modern', 'futuristic'];
    const colors = ['default', 'primary', 'secondary', 'accent'];
    for (const variant of variants) {
      for (const color of colors) {
        const btn = page.locator(`.example-section button.${variant}.${color}`);
        if (await btn.count() === 0) continue;
        await expect(btn.first()).toBeVisible();
        await expect(btn.first()).toHaveClass(new RegExp(variant));
        if (color !== 'default') await expect(btn.first()).toHaveClass(new RegExp(color));
        // Vérifie data-variant
        await expect(btn.first()).toHaveAttribute('data-variant', variant);
      }
    }
  });

  // Liens <a> stylés en bouton
  test('Vérifie les <a class="button"> (link as button)', async ({ page }) => {
    const section = page.locator('h3:has-text("Lien bouton") + .example-section');
    const links = section.locator('a.button');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const a = links.nth(i);
      await expect(a).toBeVisible();
      // Vérifie href
      const href = await a.getAttribute('href');
      expect(href).not.toBeNull();
      // Vérifie target/rel/download si présents
      const target = await a.getAttribute('target');
      if (target) await expect(a).toHaveAttribute('rel', /noopener|noreferrer/);
      // Vérifie aria-label si icône seule
      const hasIcon = await a.locator('svg').count() > 0;
      if (hasIcon && !(await a.textContent()).trim()) {
        const aria = await a.getAttribute('aria-label');
        expect(aria).not.toBeNull();
      }
    }
  });

  // Interactions (clic)
  test('Clic sur bouton déclenche action (si démo)', async ({ page }) => {
    const section = page.locator('h3:has-text("Bouton action") + .example-section');
    const btn = section.locator('button', { hasText: 'Action' });
    if (await btn.count() > 0) {
      await btn.click();
      // Vérifie apparition d’un feedback ou d’un changement d’état si présent
      // (adapter selon la démo réelle)
    }
  });

  // Boutons toggle (aria-pressed)
  test('Boutons toggle ont aria-pressed', async ({ page }) => {
    const section = page.locator('h3:has-text("Toggle") + .example-section');
    const toggles = section.locator('button[aria-pressed]');
    const count = await toggles.count();
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const btn = toggles.nth(i);
        const pressed = await btn.getAttribute('aria-pressed');
        expect(["true","false"]).toContain(pressed);
      }
    }
  });

  // Responsive
  test('Responsive : boutons visibles et accessibles en mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    const section = page.locator('h2:has-text("Variants") + .example-section');
    const btn = section.locator('button');
    await expect(btn.first()).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  // Types de bouton
  test('Vérifie les types de bouton', async ({ page }) => {
    const types = ['button', 'submit', 'reset'];
    const section = page.locator('h2:has-text("Types de boutons") + .example-section');
    for (const type of types) {
      const btn = section.locator(`button[type="${type}"]`);
      await expect(btn).toHaveCount(1);
    }
  });

  // Boutons avec icônes
  test('Icônes à gauche et à droite', async ({ page }) => {
    // Icônes à gauche (within examples only)
    const leftIcons = page.locator('.example-section button:has(svg)');
    await expect(leftIcons.first()).toBeVisible();

    // Vérifie que les boutons ont bien leur texte
    await expect(leftIcons.first()).toContainText(/Télécharger|Uploader|J'aime|Lancer/);

    // Icônes à droite – restrict to example section, avoid duplicate selectors
    const rightIcons = page.locator('.example-section button:has-text("Suivant"), .example-section button:has-text("Continuer"), .example-section button:has-text("Envoyer"), .example-section button:has-text("Activer")');
    await expect(rightIcons.first()).toBeVisible();
  });

  // Boutons icône seule
  test('Boutons icône seule ont aria-label', async ({ page }) => {
    const section = page.locator('h3:has-text("Bouton icône seule") + .example-section');
    const iconOnlyBtns = section.locator('button');
    const count = await iconOnlyBtns.count();
    expect(count).toBe(4);
    for (let i = 0; i < count; i++) {
      const btn = iconOnlyBtns.nth(i);
      const aria = await btn.getAttribute('aria-label');
      expect(aria).not.toBeNull();
    }
  });

  // Boutons disabled
  test('Vérifie que les boutons désactivés le sont', async ({ page }) => {
    const section = page.locator('h3:has-text("Disabled") + .example-section');
    const disabledBtns = section.locator('button:disabled');
    const count = await disabledBtns.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const btn = disabledBtns.nth(i);
      await expect(btn).toBeDisabled();
    }
  });

  // Exemples de formulaire
  test('Formulaire de connexion', async ({ page }) => {
    const submitBtn = page.locator('form button[type="submit"]');
    const resetBtn = page.locator('form button[type="reset"]');
    await expect(submitBtn).toHaveText(/Se connecter/);
    await expect(resetBtn).toHaveText(/Réinitialiser/);
  });

  // Boutons d’action
  test('Boutons d’action avec icône', async ({ page }) => {
    const actions = ['Créer', 'Modifier', 'Supprimer'];
    for (const action of actions) {
      const btn = page.locator(`.button-group button:has-text("${action}")`);
      await expect(btn).toBeVisible();
      const svg = btn.locator('svg');
      await expect(svg).toBeVisible();
    }
  });

  // Boutons de navigation
  test('Boutons de navigation avec icône gauche/droite', async ({ page }) => {
    const section = page.locator('h3:has-text("Boutons de navigation") + .example-section');
    const navGroup = section.locator('.button-group');
    const prevBtn = navGroup.locator('button:has-text("Précédent")');
    const nextBtn = navGroup.locator('button:has-text("Suivant")');

    await expect(prevBtn).toHaveCount(1);
    await expect(prevBtn).toBeVisible();
    await expect(prevBtn.locator('svg')).toBeVisible();

    await expect(nextBtn).toHaveCount(1);
    await expect(nextBtn).toBeVisible();
    await expect(nextBtn.locator('svg')).toBeVisible();
  });

  // Checklist a11y et focus
  test('Checklist a11y : role, aria-label, tabindex, focus', async ({ page }) => {
    const btns = page.locator('button, a.button');
    const count = await btns.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const el = btns.nth(i);
      // role
      const role = await el.getAttribute('role');
      if (el.evaluate(node => node.tagName === 'A')) {
        expect([null, 'button', 'link']).toContain(role);
      } else {
        expect([null, 'button']).toContain(role);
      }
      // aria-label si icône seule
      const hasIcon = await el.locator('svg').count() > 0;
      if (hasIcon && !(await el.textContent()).trim()) {
        const aria = await el.getAttribute('aria-label');
        expect(aria).not.toBeNull();
      }
      // tabindex
      const tabindex = await el.getAttribute('tabindex');
      if (tabindex) expect(["0","-1"]).toContain(tabindex);
    }
  });

});
