import { test, expect } from '@playwright/test';

// UI tests for the Alert documentation page.  We exercise the live
// examples that appear on /fr/docs/design/alert.

test.describe('AlertComponent – Page de documentation complète', () => {
  const url = 'http://localhost:4321/fr/docs/design/alert';

  test('page de documentation existe (200)', async ({ request }) => {
    const res = await request.get(url);
    expect(res.status()).toBe(200);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(url);
  });

  test('Démo interactive : statuts, dismissible, fermeture, icône', async ({ page }) => {
    const buttons = page.locator('.demo-section button');
    const statuses = ['info', 'success', 'warning', 'danger', 'dismissible'];
    for (let i = 0; i < statuses.length; i++) {
      const status = statuses[i];
      await buttons.nth(i).click();
      const demo = page.locator(`#demo-${status}`);
      const alertEl = demo.locator('div.alert');
      await expect(alertEl).toBeVisible();
      // Vérifie présence icône
      await expect(alertEl.locator('svg')).toHaveCount(1);
      // Vérifie structure : strong + p
      await expect(alertEl.locator('strong')).toHaveCount(1);
      await expect(alertEl.locator('p')).toHaveCount(1);
      // Vérifie rôle et data-status
      await expect(alertEl).toHaveAttribute('role', 'alert');
      await expect(alertEl).toHaveAttribute('data-status', new RegExp(status === 'dismissible' ? 'info|success|warning|danger' : status));
      if (status === 'dismissible') {
        const close = alertEl.locator('button.alert-close');
        await expect(close).toBeVisible();
        await close.click();
        await expect(alertEl).toHaveCount(0);
      }
    }
  });

  test('Statuts de base : texte, structure, aria', async ({ page }) => {
    const section = page.locator('h3:has-text("Différents statuts")');
    const alerts = section.locator('xpath=following-sibling::div[contains(@class,"alert")][position()<=4]');
    await expect(alerts).toHaveCount(4);
    const messages = [
      'Ceci est une information importante.',
      "Opération réussie avec succès !",
      'Attention, cette action est irréversible.',
      "Une erreur critique s'est produite."
    ];
    for (let i = 0; i < messages.length; i++) {
      await expect(alerts.nth(i)).toHaveText(new RegExp(messages[i]));
      await expect(alerts.nth(i)).toHaveAttribute('role', 'alert');
      await expect(alerts.nth(i)).toHaveAttribute('data-status', /info|success|warning|danger/);
    }
  });

  test('Exemples avec titre, slot, structure', async ({ page }) => {
    await expect(
      page.locator('div.alert', { hasText: 'Information Consultez la documentation pour plus de détails.' })
    ).toBeVisible();
    await expect(
      page.locator('div.alert', { hasText: 'Succès Votre fichier a été téléchargé correctement.' })
    ).toBeVisible();
    const slotAlert = page.locator('div.alert', { hasText: 'slot' });
    await expect(slotAlert).toBeVisible();
    await expect(slotAlert.locator('em')).toHaveCount(1);
    await expect(slotAlert.locator('strong')).toHaveCount(1);
    await expect(slotAlert.locator('p')).toHaveCount(1);
  });

  test('Variants : tous les messages, classes, aria', async ({ page }) => {
    const variantMessages: Record<string, string[]> = {
      initial: [
        'Information - variant initial',
        'Succès - variant initial',
        'Avertissement - variant initial',
        'Erreur - variant initial'
      ],
      retro: [
        'Information - style rétro',
        'Succès - style rétro',
        'Avertissement - style rétro',
        'Erreur - style rétro'
      ],
      modern: [
        'Information - style moderne',
        'Succès - style moderne',
        'Avertissement - style moderne',
        'Erreur - style moderne'
      ],
      futuristic: [
        'Information - style futuriste',
        'Succès - style futuriste',
        'Avertissement - style futuriste',
        'Erreur - style futuriste'
      ]
    };
    for (const [variant, msgs] of Object.entries(variantMessages)) {
      for (const text of msgs) {
        const alert = page.locator('div.alert', { hasText: text });
        await expect(alert).toBeVisible();
        await expect(alert).toHaveClass(new RegExp(variant));
        await expect(alert).toHaveAttribute('role', 'alert');
      }
    }
  });

  // Checklist a11y et responsive
  test('Checklist a11y : role, aria, tabindex, responsive', async ({ page }) => {
    // role, aria, tabindex sur tous les .alert
    const alerts = page.locator('div.alert');
    const count = await alerts.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const el = alerts.nth(i);
      await expect(el).toHaveAttribute('role', 'alert');
      // tabindex facultatif
      const tabindex = await el.getAttribute('tabindex');
      if (tabindex) expect(["0","-1"]).toContain(tabindex);
    }
    // Responsive
    await page.setViewportSize({ width: 375, height: 800 });
    await expect(alerts.first()).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 800 });
  });
});