import { test, expect } from '@playwright/test';

const locales = ['fr', 'en', 'ar', 'es'];
const variants = ['initial', 'retro', 'modern', 'futuristic'];

test.describe('Parcours critique - Connexion', () => {
  locales.forEach(locale => {
    test(`Connexion locale=${locale}`, async ({ page }) => {
      await page.goto(`/${locale}/connexion`);
      await page.fill('input[name="email"]', 'user@test.local');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(`/${locale}/dashboard`);
      await expect(page.locator('.avatar')).toBeVisible();
    });
  });
});

test.describe('Parcours critique - Inscription', () => {
  locales.forEach(locale => {
    test(`Inscription locale=${locale}`, async ({ page }) => {
      await page.goto(`/${locale}/inscription`);
      await page.fill('input[name="email"]', `newuser+${locale}@test.local`);
      await page.fill('input[name="password"]', 'password123');
      await page.fill('input[name="username"]', `newuser${locale}`);
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(`/${locale}/dashboard`);
      await expect(page.locator('.avatar')).toBeVisible();
    });
  });
});

test.describe('Parcours critique - Multi-variant', () => {
  variants.forEach(variant => {
    test(`Accueil variant=${variant}`, async ({ page }) => {
      await page.goto(`/fr/?variant=${variant}`);
      await expect(page.locator(`.variant-${variant}`)).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
    });
  });
});

test.describe('Parcours critique - Erreurs serveur', () => {
  test('Page 404', async ({ page }) => {
    await page.goto('/fr/unknown-page');
    await expect(page.locator('.error-404')).toBeVisible();
  });
  test('Page 500', async ({ page }) => {
    await page.goto('/fr/trigger-server-error');
    await expect(page.locator('.error-500')).toBeVisible();
  });
});
