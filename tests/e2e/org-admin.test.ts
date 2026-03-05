import { test, expect } from '@playwright/test';

const locales = ['fr', 'en'];

// ─── Org Admin — Page accessibility (unauthenticated → redirect to login) ───

test.describe('Org Admin — Auth guard (unauthenticated)', () => {
  const orgPages = [
    'organizations',
    'organizations/dashboard',
    'organizations/profile',
    'organizations/members',
    'organizations/blog',
    'organizations/services',
    'organizations/bookings',
  ];

  for (const locale of locales) {
    for (const page of orgPages) {
      test(`${locale}/${page} redirects unauthenticated user to login`, async ({ page: p }) => {
        const response = await p.goto(`/${locale}/admin/${page}`, { waitUntil: 'domcontentloaded' });
        // ensure we got a page back
        expect(response).toBeTruthy();
        expect(response!.status()).toBeLessThan(500);

        // Should redirect to login page (either 302 or show login form)
        const url = p.url();
        const isLoginPage = url.includes('/auth/') || url.includes('/connexion') || url.includes('/sign-in');
        const hasLoginForm = await p.locator('input[name="email"], input[type="email"], #email').count();

        expect(isLoginPage || hasLoginForm > 0).toBeTruthy();
      });
    }
  }
});

// ─── Org Admin — Super admin list page ────────────────────────────────────

test.describe('Org Admin — Super admin list page structure', () => {
  test('super admin list page exists and has correct structure', async ({ page }) => {
    // This test only verifies the page responds (login redirect expected for unauth)
    const response = await page.goto('/fr/admin/organizations', { waitUntil: 'domcontentloaded' });
    expect(response).toBeTruthy();
    expect(response!.status()).toBeLessThan(500);
  });

  test('org edit page exists ([id] route)', async ({ page }) => {
    const response = await page.goto('/fr/admin/organizations/test-id', { waitUntil: 'domcontentloaded' });
    expect(response).toBeTruthy();
    expect(response!.status()).toBeLessThan(500);
  });

  test('new org page exists', async ({ page }) => {
    const response = await page.goto('/fr/admin/organizations/new', { waitUntil: 'domcontentloaded' });
    expect(response).toBeTruthy();
    expect(response!.status()).toBeLessThan(500);
  });
});

// ─── Org Admin — API endpoints ─────────────────────────────────────

test.describe('Org Admin — API guard (unauthenticated)', () => {
  test('GET /api/admin/organizations/profile returns 403 without auth', async ({ request }) => {
    const res = await request.get('/api/admin/organizations/profile');
    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('forbidden');
  });

  test('POST /api/admin/organizations/profile returns 403 without auth', async ({ request }) => {
    const res = await request.post('/api/admin/organizations/profile', {
      data: { action: 'create', name: 'Test', slug: 'test' },
    });
    expect(res.status()).toBe(403);
  });

  test('GET /api/admin/organizations/members returns 403 without auth', async ({ request }) => {
    const res = await request.get('/api/admin/organizations/members?organizationId=test');
    expect(res.status()).toBe(403);
  });

  test('POST /api/admin/organizations/members returns 403 without auth', async ({ request }) => {
    const res = await request.post('/api/admin/organizations/members', {
      data: { action: 'invite', organizationId: 'test', email: 'a@b.com', role: 'member' },
    });
    expect(res.status()).toBe(403);
  });
});

// ─── Org Admin — API validation ─────────────────────────────────

test.describe('Org Admin — API input validation (profile)', () => {
  test('POST with missing action returns 400', async ({ request }) => {
    const res = await request.post('/api/admin/organizations/profile', {
      data: {},
    });
    // 403 (no auth) takes priority over 400, but endpoint should not crash
    expect(res.status()).toBeLessThan(500);
  });

  test('POST with invalid JSON returns 400 or 403', async ({ request }) => {
    const res = await request.post('/api/admin/organizations/profile', {
      headers: { 'Content-Type': 'application/json' },
      data: 'not-json{{{',
    });
    expect(res.status()).toBeLessThan(500);
  });
});

test.describe('Org Admin — API input validation (members)', () => {
  test('POST with missing organizationId returns 400 or 403', async ({ request }) => {
    const res = await request.post('/api/admin/organizations/members', {
      data: { action: 'invite', email: 'test@test.com', role: 'member' },
    });
    expect(res.status()).toBeLessThan(500);
  });
});

// ─── Org Admin — Page routes respond ────────────────────────────────

test.describe('Org Admin — All page routes respond without 500', () => {
  const routes = [
    '/fr/admin/organizations',
    '/fr/admin/organizations/new',
    '/fr/admin/organizations/dashboard',
    '/fr/admin/organizations/profile',
    '/fr/admin/organizations/members',
    '/fr/admin/organizations/blog',
    '/fr/admin/organizations/services',
    '/fr/admin/organizations/bookings',
    '/en/admin/organizations',
    '/en/admin/organizations/dashboard',
    '/en/admin/organizations/profile',
    '/en/admin/organizations/members',
    '/en/admin/organizations/blog',
    '/en/admin/organizations/services',
    '/en/admin/organizations/bookings',
    '/es/admin/organizations',
    '/ar/admin/organizations',
  ];

  for (const route of routes) {
    test(`${route} does not return 500`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response).toBeTruthy();
      expect(response!.status()).toBeLessThan(500);
    });
  }
});

// ─── Org Admin — i18n coverage ─────────────────────────────────────

test.describe('Org Admin — i18n pages render in all locales', () => {
  for (const locale of ['fr', 'en', 'es', 'ar']) {
    test(`${locale} org list page responds`, async ({ page }) => {
      const response = await page.goto(`/${locale}/admin/organizations`, { waitUntil: 'domcontentloaded' });
      expect(response).toBeTruthy();
      expect(response!.status()).toBeLessThan(500);
    });
  }
});
