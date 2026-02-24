import { test, expect } from '@playwright/test';

test.describe('FormComponents – documentation page (couverture totale)', () => {
  const url = 'http://localhost:4321/fr/docs/design/form';

  test('page existe (200)', async ({ request }) => {
    const res = await request.get(url);
    expect(res.status()).toBe(200);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(url);
  });

  // Grid : tous les variants et formulaires principaux
  test('FormCard : tous variants, titres, champs, boutons', async ({ page }) => {
    const grid = page.locator('.example-grid');
    const forms = [
      { variant: 'initial', title: 'Connexion', fields: ['Email', 'Mot de passe'], button: 'Se connecter' },
      { variant: 'retro', title: 'Inscription', fields: ["Nom d'utilisateur", 'Email'], button: "S'inscrire" },
      { variant: 'modern', title: 'Contact', fields: ['Nom complet', 'Message'], button: 'Envoyer' },
      { variant: 'futuristic', title: 'Paramètres', fields: ["Nom d'affichage", 'Bio'], button: 'Sauvegarder' },
    ];
    for (const form of forms) {
      const card = grid.locator('h4', { hasText: form.title }).locator('..');
      await expect(card).toBeVisible();
      for (const field of form.fields) {
        await expect(card.locator('label')).toContainText(field);
      }
      await expect(card.locator('button')).toContainText(form.button);
    }
  });

  // Champs : Input, PasswordInput, Textarea, Select, Checkbox, Radio, Switch, DatePicker
  test('Form : tous les champs présents et interactifs', async ({ page }) => {
    // Email input
    const email = page.locator('input[type="email"]');
    await expect(email.first()).toBeVisible();
    await email.first().fill('test@example.com');
    // Password input
    const pwd = page.locator('input[type="password"]');
    await expect(pwd.first()).toBeVisible();
    await pwd.first().fill('motdepasse');
    // Textarea
    const textarea = page.locator('textarea');
    await expect(textarea.first()).toBeVisible();
    await textarea.first().fill('Ceci est un message.');
    // Checkbox
    const checkbox = page.locator('input[type="checkbox"]');
    if (await checkbox.count() > 0) {
      await checkbox.first().check();
      await expect(checkbox.first()).toBeChecked();
    }
    // Radio
    const radio = page.locator('input[type="radio"]');
    if (await radio.count() > 0) {
      await radio.first().check();
      await expect(radio.first()).toBeChecked();
    }
    // Switch
    const sw = page.locator('input[role="switch"]');
    if (await sw.count() > 0) {
      await sw.first().check();
      expect(await sw.first().getAttribute('aria-checked')).toBe('true');
    }
    // DatePicker (input type date ou text)
    const date = page.locator('input[type="date"], input[type="text"][name*="date"]');
    if (await date.count() > 0) {
      await date.first().fill('2026-02-24');
    }
  });

  // Alertes de validation (error, success, warning, info)
  test('Form : alertes de validation (error, success, warning, info)', async ({ page }) => {
    const alerts = [
      { status: 'error', text: 'Erreur' },
      { status: 'success', text: 'Bravo' },
      { status: 'warning', text: 'Attention' },
      { status: 'info', text: 'Info' },
    ];
    for (const alert of alerts) {
      await expect(page.locator(`.alert.${alert.status}`)).toContainText(alert.text);
    }
  });

  // Champs disabled
  test('Form : champs disabled', async ({ page }) => {
    const disabled = page.locator('input:disabled, textarea:disabled, select:disabled');
    if (await disabled.count() > 0) {
      for (let i = 0; i < await disabled.count(); i++) {
        await expect(disabled.nth(i)).toBeDisabled();
      }
    }
  });

  // Checklist a11y : aria, labels, required, focus
  test('Form : accessibilité (aria, labels, required, focus)', async ({ page }) => {
    // Tous les labels liés à un champ
    const labels = page.locator('label');
    for (let i = 0; i < await labels.count(); i++) {
      const label = labels.nth(i);
      const forAttr = await label.getAttribute('for');
      if (forAttr) {
        const input = page.locator(`#${forAttr}`);
        await expect(input).toBeVisible();
      }
    }
    // Champs required
    const required = page.locator('[required]');
    if (await required.count() > 0) {
      for (let i = 0; i < await required.count(); i++) {
        await expect(required.nth(i)).toBeVisible();
      }
    }
    // Focus visible
    const input = page.locator('input, textarea, select').first();
    await input.focus();
    const outline = await input.evaluate(e => getComputedStyle(e).outlineStyle);
    expect(outline === 'solid' || outline === 'auto').toBeTruthy();
  });

  // Responsive
  test('Form : responsive (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    const grid = page.locator('.example-grid');
    await expect(grid).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 800 });
  });
});