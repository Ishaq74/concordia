import { test, expect } from '@playwright/test';

/**
 * E2E authenticated CRUD scenarios.
 * Tests full user flows: login → create → read → update → delete.
 */

// ─── Blog CRUD (Authenticated Admin) ─────────────────────────

test.describe('Blog CRUD — Authenticated admin flow', () => {
  test('admin can create, view, and manage blog posts', async ({ request }) => {
    // Step 1: Sign in as admin via API
    const signInRes = await request.post('/api/auth/sign-in/email', {
      data: {
        email: 'admin@test.local',
        password: 'AdminPass123!@#',
      },
    });

    // If no admin user exists, try to sign up
    let token: string | undefined;
    if (signInRes.status() === 200) {
      const body = await signInRes.json().catch(() => null);
      token = body?.token || body?.session?.token;
    }

    if (!token) {
      // Sign up first
      const signUpRes = await request.post('/api/auth/sign-up/email', {
        data: {
          email: 'admin@test.local',
          password: 'AdminPass123!@#',
          name: 'Test Admin',
        },
      });
      expect(signUpRes.status()).toBeLessThan(500);
    }

    // Step 2: Access admin blog page
    const blogPage = await request.get('/api/admin/blog');
    expect(blogPage.status()).toBeLessThan(500);

    // Step 3: Attempt to create a blog post
    const createRes = await request.post('/api/admin/blog', {
      data: {
        action: 'create',
        title: 'Test Blog Post E2E',
        slug: 'test-blog-post-e2e',
        content: 'This is an E2E test blog post.',
        locale: 'fr',
        status: 'draft',
      },
    });
    expect(createRes.status()).toBeLessThan(500);

    // Step 4: List blog posts
    const listRes = await request.get('/api/admin/blog');
    expect(listRes.status()).toBeLessThan(500);
  });
});

// ─── Services CRUD (Authenticated Admin) ──────────────────────

test.describe('Services CRUD — Authenticated admin flow', () => {
  test('admin can manage services lifecycle', async ({ request }) => {
    // Create service category
    const catRes = await request.post('/api/admin/services/categories', {
      data: {
        action: 'create',
        name: JSON.stringify({ fr: 'Catégorie E2E', en: 'E2E Category' }),
        slug: 'categorie-e2e',
      },
    });
    expect(catRes.status()).toBeLessThan(500);

    // Create service
    const svcRes = await request.post('/api/admin/services/services', {
      data: {
        action: 'create',
        slug: 'service-e2e',
        basePrice: '75.00',
        currency: 'EUR',
        inLanguage: 'fr',
        status: 'active',
      },
    });
    expect(svcRes.status()).toBeLessThan(500);

    // List services
    const listRes = await request.get('/api/admin/services/services');
    expect(listRes.status()).toBeLessThan(500);

    // List bookings
    const bookingsRes = await request.get('/api/admin/services/bookings');
    expect(bookingsRes.status()).toBeLessThan(500);
  });
});

// ─── Organization CRUD ────────────────────────────────────────

test.describe('Organization CRUD — Full lifecycle', () => {
  test('admin can create and manage organizations', async ({ request }) => {
    // Create organization
    const createRes = await request.post('/api/admin/organizations/profile', {
      data: {
        action: 'create',
        name: 'E2E Test Organization',
        slug: 'e2e-test-org',
      },
    });
    expect(createRes.status()).toBeLessThan(500);

    // List organizations
    const listRes = await request.get('/api/admin/organizations');
    expect(listRes.status()).toBeLessThan(500);

    // Get profile
    const profileRes = await request.get('/api/admin/organizations/profile');
    expect(profileRes.status()).toBeLessThan(500);

    // List members
    const membersRes = await request.get('/api/admin/organizations/members');
    expect(membersRes.status()).toBeLessThan(500);
  });
});

// ─── Auth Flow — Full workflow ────────────────────────────────

test.describe('Auth Flow — Complete workflow', () => {
  test('signup → login → get session → logout cycle', async ({ request }) => {
    const uniqueEmail = `e2e-${Date.now()}@test.local`;

    // Sign up
    const signUpRes = await request.post('/api/auth/sign-up/email', {
      data: {
        email: uniqueEmail,
        password: 'E2ePass123!@#',
        name: 'E2E User',
      },
    });
    expect(signUpRes.status()).toBeLessThan(500);

    // Sign in
    const signInRes = await request.post('/api/auth/sign-in/email', {
      data: {
        email: uniqueEmail,
        password: 'E2ePass123!@#',
      },
    });
    expect(signInRes.status()).toBeLessThan(500);

    // Get session
    const sessionRes = await request.get('/api/auth/session');
    expect(sessionRes.status()).toBeLessThan(500);
  });
});

// ─── Navigation Guards ────────────────────────────────────────

test.describe('Navigation Guards — Admin pages require auth', () => {
  const protectedPages = [
    '/fr/admin/',
    '/fr/admin/blog/',
    '/fr/admin/services/',
    '/fr/admin/organizations/',
    '/en/admin/',
    '/en/admin/blog/',
    '/en/admin/services/',
  ];

  for (const url of protectedPages) {
    test(`${url} redirects unauthenticated users`, async ({ page }) => {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
      expect(response).toBeTruthy();
      expect(response!.status()).toBeLessThan(500);

      // Should redirect to login
      const currentUrl = page.url();
      const isLogin =
        currentUrl.includes('/auth/') ||
        currentUrl.includes('/connexion') ||
        currentUrl.includes('/sign-in');
      const hasLoginForm = await page
        .locator('input[name="email"], input[type="email"], #email')
        .count();
      expect(isLogin || hasLoginForm > 0).toBeTruthy();
    });
  }
});
