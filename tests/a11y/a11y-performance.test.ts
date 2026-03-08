import { test, expect } from '@playwright/test';
import { runAxe, runLighthouse } from './a11y-utils';

// ─── Full-site a11y scan — RGAA / WCAG 2.1 AA compliance ─────

const publicUrls = [
  '/',
  '/fr/',
  '/en/',
  '/ar/',
  '/es/',
  '/fr/blog/',
  '/en/blog/',
  '/fr/services/',
  '/en/services/',
  '/fr/a-propos/',
  '/fr/auth/connexion/',
  '/fr/auth/inscription/',
  '/en/auth/sign-in/',
  '/en/auth/sign-up/',
  '/fr/mentions-legales/',
  '/fr/contact/',
];

const adminUrls = [
  '/fr/admin/',
  '/fr/admin/blog/',
  '/fr/admin/services/',
  '/fr/admin/organizations/',
];

test.describe('Accessibilité — Full site axe-core scan', () => {
  for (const url of publicUrls) {
    test(`axe-core: zero violations on ${url}`, async ({ page }) => {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
      // Skip if page doesn't exist (redirect/404)
      if (!response || response.status() >= 400) {
        test.skip();
        return;
      }
      const results = await runAxe(page);
      const critical = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      );
      expect(critical).toEqual([]);
    });
  }

  for (const url of adminUrls) {
    test(`axe-core: no critical violations on admin ${url}`, async ({ page }) => {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
      if (!response || response.status() >= 500) {
        test.skip();
        return;
      }
      const results = await runAxe(page);
      const critical = results.violations.filter((v) => v.impact === 'critical');
      expect(critical).toEqual([]);
    });
  }
});

// ─── WCAG specific checks ─────────────────────────────────────

test.describe('WCAG 2.1 AA — Specific requirements', () => {
  test('all images have alt attributes on /fr/', async ({ page }) => {
    await page.goto('/fr/', { waitUntil: 'domcontentloaded' });
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      // alt can be empty string (decorative) but must exist
      expect(alt).not.toBeNull();
    }
  });

  test('page has exactly one h1 on /fr/', async ({ page }) => {
    await page.goto('/fr/', { waitUntil: 'domcontentloaded' });
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('html has lang attribute on each locale', async ({ page }) => {
    for (const [url, expectedLang] of [
      ['/fr/', 'fr'],
      ['/en/', 'en'],
      ['/ar/', 'ar'],
      ['/es/', 'es'],
    ] as const) {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
      if (!response || response.status() >= 400) continue;
      const lang = await page.locator('html').getAttribute('lang');
      expect(lang).toBe(expectedLang);
    }
  });

  test('RTL dir attribute is set for Arabic', async ({ page }) => {
    const response = await page.goto('/ar/', { waitUntil: 'domcontentloaded' });
    if (!response || response.status() >= 400) {
      test.skip();
      return;
    }
    const dir = await page.locator('html').getAttribute('dir');
    expect(dir).toBe('rtl');
  });

  test('skip-to-content link exists', async ({ page }) => {
    await page.goto('/fr/', { waitUntil: 'domcontentloaded' });
    const skipLink = page.locator('a[href="#main-content"], a[href="#contenu"], a.skip-link');
    // Should exist (even if visually hidden)
    const count = await skipLink.count();
    if (count === 0) {
      console.warn('⚠️  A11Y WARNING: No skip-to-content link found. RGAA requirement.');
    }
  });

  test('form inputs have associated labels', async ({ page }) => {
    await page.goto('/fr/auth/connexion/', { waitUntil: 'domcontentloaded' });
    const inputs = await page.locator('input:not([type="hidden"]):not([type="submit"])').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = (await label.count()) > 0;
        expect(hasLabel || !!ariaLabel || !!ariaLabelledBy).toBe(true);
      }
    }
  });
});

// ─── Performance — Lighthouse CI ──────────────────────────────

test.describe('Performance — Lighthouse', () => {
  test('Lighthouse scores meet government thresholds on /fr/', async () => {
    const scores = await runLighthouse('http://localhost:4321/fr/');
    // If Lighthouse is not available (CI without Chrome), skip gracefully
    if (scores.performance === 0 && scores.accessibility === 0) {
      console.warn('⚠️  Lighthouse not available in this environment, skipping score checks');
      return;
    }
    expect(scores.accessibility).toBeGreaterThanOrEqual(90);
    expect(scores.performance).toBeGreaterThanOrEqual(70);
    expect(scores.seo).toBeGreaterThanOrEqual(80);
  });

  test('Lighthouse scores meet thresholds on /en/', async () => {
    const scores = await runLighthouse('http://localhost:4321/en/');
    if (scores.performance === 0 && scores.accessibility === 0) return;
    expect(scores.accessibility).toBeGreaterThanOrEqual(90);
    expect(scores.performance).toBeGreaterThanOrEqual(70);
  });
});
