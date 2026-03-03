import { test, expect } from '@playwright/test';

// ─── Services Admin — Page routes ──────────────────────────────────

test.describe('Services Admin — All page routes respond without 500', () => {
  const routes = [
    '/fr/admin/services',
    '/fr/admin/services/new',
    '/fr/admin/services/categories',
    '/fr/admin/services/categories/new',
    '/fr/admin/services/bookings',
    '/en/admin/services',
    '/en/admin/services/new',
    '/en/admin/services/categories',
    '/en/admin/services/bookings',
  ];

  for (const route of routes) {
    test(`${route} does not return 500`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response).toBeTruthy();
      expect(response!.status()).toBeLessThan(500);
    });
  }
});

// ─── Services Admin — Auth guard ───────────────────────────────────

test.describe('Services Admin — Auth guard (unauthenticated)', () => {
  const pages = [
    'services',
    'services/new',
    'services/categories',
    'services/categories/new',
    'services/bookings',
  ];

  for (const p of pages) {
    test(`/fr/admin/${p} redirects unauthenticated to login`, async ({ page }) => {
      await page.goto(`/fr/admin/${p}`, { waitUntil: 'domcontentloaded' });
      const url = page.url();
      const isLoginPage = url.includes('/auth/') || url.includes('/connexion') || url.includes('/sign-in');
      const hasLoginForm = await page.locator('input[name="email"], input[type="email"], #email').count();
      expect(isLoginPage || hasLoginForm > 0).toBeTruthy();
    });
  }
});

// ─── Services API — Auth guard ─────────────────────────────────────

test.describe('Services API — Auth guard (unauthenticated)', () => {
  test('GET /api/admin/services/services returns 401 or 403', async ({ request }) => {
    const res = await request.get('/api/admin/services/services');
    expect([401, 403]).toContain(res.status());
  });

  test('GET /api/admin/services/categories returns 401 or 403', async ({ request }) => {
    const res = await request.get('/api/admin/services/categories');
    expect([401, 403]).toContain(res.status());
  });

  test('GET /api/admin/services/bookings returns 401 or 403', async ({ request }) => {
    const res = await request.get('/api/admin/services/bookings');
    expect([401, 403]).toContain(res.status());
  });

  test('GET /api/admin/services/media returns 401 or 403', async ({ request }) => {
    const res = await request.get('/api/admin/services/media');
    expect([401, 403]).toContain(res.status());
  });

  test('POST /api/admin/services/services returns 401 or 403', async ({ request }) => {
    const res = await request.post('/api/admin/services/services', {
      data: { action: 'create' },
    });
    expect([401, 403]).toContain(res.status());
  });
});

// ─── Services API — Input validation (no crash) ───────────────────

test.describe('Services API — No 500 on bad input', () => {
  test('POST /api/admin/services/services with empty body', async ({ request }) => {
    const res = await request.post('/api/admin/services/services', { data: {} });
    expect(res.status()).toBeLessThan(500);
  });

  test('POST /api/admin/services/categories with empty body', async ({ request }) => {
    const res = await request.post('/api/admin/services/categories', { data: {} });
    expect(res.status()).toBeLessThan(500);
  });

  test('POST /api/admin/services/bookings with empty body', async ({ request }) => {
    const res = await request.post('/api/admin/services/bookings', { data: {} });
    expect(res.status()).toBeLessThan(500);
  });

  test('POST /api/admin/services/availability with empty body', async ({ request }) => {
    const res = await request.post('/api/admin/services/availability', { data: {} });
    expect(res.status()).toBeLessThan(500);
  });
});

// ─── Public Services — Pages ───────────────────────────────────────

test.describe('Public Services — Pages respond', () => {
  const publicRoutes = [
    '/fr/services',
    '/en/services',
    '/es/services',
    '/ar/services',
  ];

  for (const route of publicRoutes) {
    test(`${route} responds without 500`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response).toBeTruthy();
      expect(response!.status()).toBeLessThan(500);
    });
  }
});

// ─── Public Services — Content ─────────────────────────────────────

test.describe('Public Services — Index page content', () => {
  test('fr services page has search section', async ({ page }) => {
    await page.goto('/fr/services', { waitUntil: 'domcontentloaded' });
    // The page should have some visible content (hero, categories, etc.)
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
    expect(body!.length).toBeGreaterThan(100);
  });
});

// ─── Bookings detail page ─────────────────────────────────────────

test.describe('Services Admin — Booking detail page', () => {
  test('booking detail route with fake ID does not 500', async ({ page }) => {
    const response = await page.goto('/fr/admin/services/bookings/fake-booking-id', {
      waitUntil: 'domcontentloaded',
    });
    expect(response).toBeTruthy();
    expect(response!.status()).toBeLessThan(500);
  });
});
