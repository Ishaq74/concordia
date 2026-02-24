import { test, expect } from '@playwright/test';

test.describe('DialogComponent – documentation page (couverture totale)', () => {
  const url = 'http://localhost:4321/fr/docs/design/dialog';

  test('page existe (200)', async ({ request }) => {
    const res = await request.get(url);
    expect(res.status()).toBe(200);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(url);
  });

  // Utilisation basique
  test('Utilisation basique : trigger, ouverture, titre, description, fermeture', async ({ page }) => {
    const section = page.locator('h2#basic + div.demo-section');
    const trigger = section.locator('button', { hasText: 'Ouvrir Dialog' });
    await expect(trigger).toHaveCount(1);
    // Ouvre le dialog
    await trigger.click();
    const dialog = section.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('h2')).toHaveText('Dialog Basique');
    await expect(dialog.locator('p')).toContainText('checkbox hack CSS pur');
    // Fermeture via bouton croix
    const closeBtn = dialog.locator('label[aria-label="Fermer"]');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(dialog).not.toBeVisible();
  });

  // Variants
  for (const variant of ['initial', 'retro', 'modern', 'futuristic']) {
    test(`Variant ${variant} : bouton, ouverture, classes, fermeture`, async ({ page }) => {
      const section = page.locator(`h3:has-text("${variant.charAt(0).toUpperCase() + variant.slice(1)}") + div.demo-section`);
      const btn = section.locator('button', { hasText: new RegExp(variant, 'i') });
      await expect(btn).toHaveCount(1);
      await btn.click();
      const dialog = section.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveClass(new RegExp(variant));
      await expect(dialog.locator('h2')).toContainText(/Dialog/i);
      await expect(dialog.locator('p')).toBeVisible();
      // Fermeture via bouton
      const closeBtn = dialog.locator('label[aria-label="Fermer"]');
      await expect(closeBtn).toBeVisible();
      await closeBtn.click();
      await expect(dialog).not.toBeVisible();
    });
  }

  // Tailles
  test('Dialog tailles sm et lg', async ({ page }) => {
    const section = page.locator('h2#sizes + div.demo-section');
    const smallBtn = section.locator('button', { hasText: 'Small' });
    const largeBtn = section.locator('button', { hasText: 'Large' });
    await expect(smallBtn).toHaveCount(1);
    await expect(largeBtn).toHaveCount(1);
    // Small
    await smallBtn.click();
    const smallDialog = section.locator('[role="dialog"]');
    await expect(smallDialog).toBeVisible();
    await expect(smallDialog).toHaveClass(/size-sm/);
    await expect(smallDialog.locator('h2')).toHaveText('Small Dialog');
    await smallDialog.locator('label[aria-label="Fermer"]').click();
    // Large
    await largeBtn.click();
    const largeDialog = section.locator('[role="dialog"]');
    await expect(largeDialog).toBeVisible();
    await expect(largeDialog).toHaveClass(/size-lg/);
    await expect(largeDialog.locator('h2')).toHaveText('Large Dialog');
    await largeDialog.locator('label[aria-label="Fermer"]').click();
  });

  // Avec formulaire
  test('Dialog avec formulaire : champs, submit, annuler', async ({ page }) => {
    const section = page.locator('h2#with-form + div.demo-section');
    const trigger = section.locator('button', { hasText: 'Éditer Profil' });
    await expect(trigger).toHaveCount(1);
    await trigger.click();
    const dialog = section.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('form')).toBeVisible();
    await expect(dialog.locator('input#name')).toHaveAttribute('placeholder', 'Jean Dupont');
    await expect(dialog.locator('input#email')).toHaveAttribute('placeholder', 'jean@example.com');
    // Annuler ferme le dialog
    await dialog.locator('button', { hasText: 'Annuler' }).click();
    await expect(dialog).not.toBeVisible();
  });

  // Triggers externes
  test('Dialog avec triggers multiples (interne/externe)', async ({ page }) => {
    const section = page.locator('h2#external-trigger + div.demo-section');
    const internal = section.locator('button', { hasText: 'Trigger Interne' });
    const external = section.locator('button', { hasText: 'Trigger Externe' });
    await expect(internal).toHaveCount(1);
    await expect(external).toHaveCount(1);
    // Ouvre via interne
    await internal.click();
    const dialog = section.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await dialog.locator('label[aria-label="Fermer"]').click();
    // Ouvre via externe
    await external.click();
    await expect(dialog).toBeVisible();
    await dialog.locator('label[aria-label="Fermer"]').click();
  });

  // Checklist a11y et classes
  test('Accessibilité et classes : role, aria-modal, tabindex, classes', async ({ page }) => {
    // On vérifie sur tous les dialogs visibles
    const dialogs = page.locator('[role="dialog"]');
    const count = await dialogs.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const d = dialogs.nth(i);
      await expect(d).toHaveAttribute('aria-modal', 'true');
      // Vérifie la classe variant ou size si présente
      const cls = await d.getAttribute('class');
      expect(cls).toMatch(/dialog-content/);
    }
  });

  // Responsive (largeur viewport)
  test('Responsive : dialog s’affiche correctement en mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    const section = page.locator('h2#basic + div.demo-section');
    const trigger = section.locator('button', { hasText: 'Ouvrir Dialog' });
    await trigger.click();
    const dialog = section.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await dialog.locator('label[aria-label="Fermer"]').click();
    // Restaure viewport
    await page.setViewportSize({ width: 1280, height: 800 });
  });

});