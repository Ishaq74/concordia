import { test, expect } from '@playwright/test';

// UI tests for the Switch documentation page.  We only exercise a few
// distinct examples to verify the page renders correctly; the components
// themselves are covered by unit tests.

test.describe('SwitchComponent – documentation page', () => {
  const url = 'http://localhost:4321/fr/docs/design/switch';

  test('page exists (200)', async ({ request }) => {
    const res = await request.get(url);
    expect(res.status()).toBe(200);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(url);
  });

  test('basic demo shows labelled switch', async ({ page }) => {
    const section = page.locator('h2#basic + div.demo-section');
    await expect(section.locator('text=Activer les notifications')).toHaveCount(1);
    await expect(section.locator('input[role="switch"]')).toHaveCount(1);
  });

  test('variant groups render on/off examples', async ({ page }) => {
    for (const variant of ['initial', 'retro', 'modern', 'futuristic']) {
      const offText = `Mode ${variant.charAt(0).toUpperCase() + variant.slice(1)} (Off)`;
      const onText = `Mode ${variant.charAt(0).toUpperCase() + variant.slice(1)} (On)`;
      const container = page.locator(`h3:has-text("${variant.charAt(0).toUpperCase() + variant.slice(1)}") + div.demo-section`);
      await expect(container.locator(`text=${offText}`)).toHaveCount(1);
      await expect(container.locator(`text=${onText}`)).toHaveCount(1);
    }
  });

  test('disabled state examples are actually disabled', async ({ page }) => {
    const section = page.locator('h2#disabled + div.demo-section');
    const switches = section.locator('input[role="switch"]');
    expect(await switches.count()).toBeGreaterThanOrEqual(2);
    // every switch in this section should be disabled
    for (let i = 0; i < await switches.count(); i++) {
      await expect(switches.nth(i)).toBeDisabled();
    }
  });
});