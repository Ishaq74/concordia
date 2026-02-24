import { test, expect } from '@playwright/test';

test.describe('SwitchComponent – documentation page (couverture totale)', () => {
  const url = 'http://localhost:4321/fr/docs/design/switch';

  test('page existe (200)', async ({ request }) => {
    const res = await request.get(url);
    expect(res.status()).toBe(200);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(url);
  });

  // Utilisation basique
  test('Switch basique : label, structure, aria', async ({ page }) => {
    const section = page.locator('h2#basic + div.demo-section');
    const input = section.locator('input[role="switch"]');
    await expect(input).toBeVisible();
    await expect(section.locator('label')).toHaveText(/Activer les notifications/);
    // aria-checked false par défaut
    expect(await input.getAttribute('aria-checked')).toBe('false');
    // label lié par for/id
    const id = await input.getAttribute('id');
    const labelFor = await section.locator('label').getAttribute('for');
    expect(labelFor).toBe(id);
  });

  // Variants (initial, retro, modern, futuristic) et états (on/off)
  test('Switch : variants et états', async ({ page }) => {
    const variants = ['initial', 'retro', 'modern', 'futuristic'];
    for (const variant of variants) {
      const v = variant.charAt(0).toUpperCase() + variant.slice(1);
      const section = page.locator(`h3:has-text("${v}") + div.demo-section`);
      // Off
      const off = section.locator('input[role="switch"]').first();
      await expect(off).toBeVisible();
      expect(await off.getAttribute('class')).toContain(variant === 'initial' ? '' : variant);
      expect(await off.getAttribute('aria-checked')).toBe('false');
      // On
      const on = section.locator('input[role="switch"]').nth(1);
      await expect(on).toBeVisible();
      expect(await on.getAttribute('class')).toContain(variant === 'initial' ? '' : variant);
      expect(await on.getAttribute('aria-checked')).toBe('true');
    }
  });

  // États : checked, unchecked
  test('Switch : états checked/unchecked', async ({ page }) => {
    const section = page.locator('h2#states + div.demo-section');
    const off = section.locator('input[role="switch"]').first();
    const on = section.locator('input[role="switch"]').nth(1);
    expect(await off.getAttribute('aria-checked')).toBe('false');
    expect(await on.getAttribute('aria-checked')).toBe('true');
  });

  // Avec labels
  test('Switch : labels personnalisés', async ({ page }) => {
    const section = page.locator('h2#labels + div.demo-section');
    const labels = [
      'Recevoir les notifications par email',
      'Accepter les communications marketing',
      'Activer les statistiques anonymes',
    ];
    for (const label of labels) {
      await expect(section.locator('label')).toContainText(label);
    }
  });

  // Disabled
  test('Switch : état disabled', async ({ page }) => {
    const section = page.locator('h2#disabled + div.demo-section');
    const switches = section.locator('input[role="switch"]');
    expect(await switches.count()).toBeGreaterThanOrEqual(2);
    for (let i = 0; i < await switches.count(); i++) {
      await expect(switches.nth(i)).toBeDisabled();
    }
  });

  // Error
  test('Switch : gestion d’erreur', async ({ page }) => {
    const section = page.locator('h2#error + div.demo-section');
    const input = section.locator('input[role="switch"]');
    await expect(input).toBeVisible();
    // aria-invalid
    expect(await input.getAttribute('aria-invalid')).toBe('true');
    // aria-describedby
    const describedby = await input.getAttribute('aria-describedby');
    expect(describedby).toContain('terms-error');
    // message d’erreur visible
    await expect(section.locator('.input-error-message')).toContainText('Vous devez accepter les conditions');
  });

  // Accessibilité : aria, focus, clavier
  test('Switch : accessibilité (aria, focus, clavier)', async ({ page }) => {
    const section = page.locator('h2#basic + div.demo-section');
    const input = section.locator('input[role="switch"]');
    // focus visible
    await input.focus();
    const outline = await input.evaluate(e => getComputedStyle(e).outlineStyle);
    expect(outline === 'solid' || outline === 'auto').toBeTruthy();
    // toggle clavier (Space)
    await input.press(' ');
    expect(await input.getAttribute('aria-checked')).toBe('true');
    await input.press(' ');
    expect(await input.getAttribute('aria-checked')).toBe('false');
  });

  // Formulaire accessible (groupe)
  test('Switch : groupe dans un formulaire accessible', async ({ page }) => {
    const section = page.locator('legend:has-text("Préférences de notification")').locator('..');
    const switches = section.locator('input[role="switch"]');
    expect(await switches.count()).toBe(3);
    // chaque switch a un label unique
    const labels = [
      'Notifications par email',
      'Notifications push',
      'Notifications SMS',
    ];
    for (const label of labels) {
      await expect(section.locator('label')).toContainText(label);
    }
    // le premier est checked
    expect(await switches.nth(0).getAttribute('aria-checked')).toBe('true');
    // les autres sont off
    expect(await switches.nth(1).getAttribute('aria-checked')).toBe('false');
    expect(await switches.nth(2).getAttribute('aria-checked')).toBe('false');
  });

  // Checklist responsive (mobile)
  test('Switch : responsive (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    const input = page.locator('input[role="switch"]');
    await expect(input.first()).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 800 });
  });
});