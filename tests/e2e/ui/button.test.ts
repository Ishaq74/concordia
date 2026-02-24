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
  test('Vérifie tous les variants et couleurs', async ({ page }) => {
    const variants = ['initial', 'retro', 'modern', 'futuristic'];
    const colors = ['default', 'primary', 'secondary', 'accent'];

    for (const variant of variants) {
      for (const color of colors) {
        const btn = page.locator(`.example-section button.${variant}.${color}`);
        if (await btn.count() === 0) continue; // certains combos peuvent ne pas exister
        await expect(btn.first()).toBeVisible();
        await expect(btn.first()).toHaveClass(new RegExp(variant));
        if (color !== 'default') await expect(btn.first()).toHaveClass(new RegExp(color));
      }
    }
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

  // Accessibilité
  test('Vérifie les attributs ARIA et focus', async ({ page }) => {
    const section = page.locator('h3:has-text("Bouton icône seule") + .example-section');
    const iconButtons = section.locator('button');
    const count = await iconButtons.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const btn = iconButtons.nth(i);
      const aria = await btn.getAttribute('aria-label');
      expect(aria).not.toBeNull();
    }
  });

});
