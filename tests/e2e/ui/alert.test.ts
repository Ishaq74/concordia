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

  test('Démo interactive affiche chaque alerte', async ({ page }) => {
    const buttons = page.locator('.demo-section button');
    const statuses = ['info', 'success', 'warning', 'danger', 'dismissible'];

    for (let i = 0; i < statuses.length; i++) {
      const status = statuses[i];
      await buttons.nth(i).click();
      const demo = page.locator(`#demo-${status}`);
      const alertEl = demo.locator('div.alert');
      await expect(alertEl).toBeVisible();
      if (status === 'dismissible') {
        const close = alertEl.locator('button.alert-close');
        await expect(close).toBeVisible();
        await close.click();
        // after clicking the close button the inner alert div is removed
        await expect(alertEl).toHaveCount(0);
      }
    }
  });

  test('Statuts de base', async ({ page }) => {
    // only look at the four alerts immediately following the corresponding h3
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
    }
  });

  test('Exemples avec titre et slot', async ({ page }) => {
    // two alerts with explicit titles and messages
    await expect(
      page.locator('div.alert', { hasText: 'Information Consultez la documentation pour plus de détails.' })
    ).toBeVisible();
    await expect(
      page.locator('div.alert', { hasText: 'Succès Votre fichier a été téléchargé correctement.' })
    ).toBeVisible();

    // slot example contains the word "slot" and an <em> element
    const slotAlert = page.locator('div.alert', { hasText: 'slot' });
    await expect(slotAlert).toBeVisible();
    await expect(slotAlert.locator('em')).toHaveCount(1);
  });

  test('Variants exist', async ({ page }) => {
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
    for (const msgs of Object.values(variantMessages)) {
      for (const text of msgs) {
        await expect(page.locator('div.alert', { hasText: text })).toBeVisible();
      }
    }
  });
});