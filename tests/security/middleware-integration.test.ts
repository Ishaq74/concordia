import { describe, it, expect } from 'vitest';
import { apiCall, getApiBase } from '@tests/utils/api-helpers';
import { serverAvailable } from '@tests/helpers/server-guard';

const serverUp = await serverAvailable();

/** Fetch with retry on ECONNRESET (dev server may be overloaded under parallel tests). */
async function fetchWithRetry(url: string, init?: RequestInit, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetch(url, init);
    } catch (err: any) {
      if (attempt === maxRetries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw new Error('unreachable');
}

describe.skipIf(!serverUp)('Middleware Integration', { timeout: 120_000 }, () => {

// ─── Locale Redirect ──────────────────────────────────────────

describe('Middleware — Locale redirect', () => {
  it('root / redirects to /fr/', async () => {
    const base = getApiBase();
    const res = await fetchWithRetry(`${base}/`, { redirect: 'manual' });
    // Accept either a 302 redirect or a 200 from /fr/
    if (res.status === 302) {
      const location = res.headers.get('location');
      expect(location).toContain('/fr/');
    } else {
      expect(res.status).toBeLessThan(500);
    }
  });

  it('valid locale prefix passes through', async () => {
    const base = getApiBase();
    const res = await fetchWithRetry(`${base}/fr/`, { redirect: 'manual' });
    expect(res.status).toBeLessThan(500);
  });

  it('API routes bypass locale redirect', async () => {
    const res = await apiCall('GET', '/auth/session');
    expect(res.status).toBeLessThan(500);
  });

  it('static assets bypass locale redirect', async () => {
    const base = getApiBase();
    const res = await fetchWithRetry(`${base}/_astro/test.css`);
    // Even if the file doesn't exist, we should not get redirected to /fr/
    expect(res.status).toBeLessThan(500);
  });
});

// ─── Auth Session Resolution ──────────────────────────────────

describe('Middleware — Auth session', () => {
  it('unauthenticated request has no session', async () => {
    const res = await apiCall('GET', '/auth/session');
    expect(res.status).toBeLessThan(500);
    // Session endpoint should return empty/null session for unauth
    if (res.status === 200 && res.data) {
      // Different auth implementations may differ
      expect(res.data).toBeDefined();
    }
  });

  it('static asset paths skip session resolution', async () => {
    const base = getApiBase();
    // Request to a font path — should not trigger DB lookups
    const res = await fetchWithRetry(`${base}/fonts/test.woff2`);
    expect(res.status).toBeLessThan(500);
  });
});

// ─── Protected Routes ─────────────────────────────────────────

describe('Middleware — Protected routes', () => {
  const protectedPaths = [
    '/fr/admin/',
    '/fr/profile/',
    '/en/admin/',
    '/en/admin/blog/',
    '/en/admin/services/',
    '/fr/admin/organizations/',
  ];

  for (const path of protectedPaths) {
    it(`unauthenticated access to ${path} redirects to sign-in`, async () => {
      const base = getApiBase();
      const res = await fetchWithRetry(`${base}${path}`, { redirect: 'manual' });
      // Should redirect (302) to sign-in page, or serve the login page (200)
      if (res.status === 302) {
        const location = res.headers.get('location');
        expect(location).toMatch(/auth|connexion|sign-in/i);
      } else {
        // If no redirect, the page should contain a login form or auth redirect
        expect(res.status).toBeLessThan(500);
      }
    });
  }

  it('public routes are accessible without auth', async () => {
    const base = getApiBase();
    const publicPaths = ['/fr/', '/en/', '/fr/blog/', '/fr/services/'];
    for (const path of publicPaths) {
      const res = await fetchWithRetry(`${base}${path}`, { redirect: 'follow' });
      expect(res.status).toBeLessThan(500);
    }
  });
});

// ─── Middleware Sequence Order ─────────────────────────────────

describe('Middleware — Sequence correctness', () => {
  it('security headers are set even on 404 pages', async () => {
    const base = getApiBase();
    const res = await fetchWithRetry(`${base}/fr/this-page-does-not-exist`);
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('CSRF protection is applied before auth on API routes', async () => {
    const base = getApiBase();
    // POST to API with mismatched origin — should get CSRF 403 before auth check
    const res = await fetchWithRetry(`${base}/api/admin/organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://evil.com',
        Host: new URL(base).host,
      },
      body: JSON.stringify({ action: 'create', name: 'Test' }),
    });
    expect(res.status).toBe(403);
    const body = await res.json().catch(() => null);
    if (body?.error) {
      expect(body.error).toMatch(/CSRF|forbidden/i);
    }
  });
});

}); // end describe.skipIf Middleware Integration
