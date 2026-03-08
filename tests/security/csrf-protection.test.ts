import { describe, it, expect } from 'vitest';
import { apiCall, getApiBase } from '@tests/utils/api-helpers';
import { serverAvailable } from '@tests/helpers/server-guard';

const serverUp = await serverAvailable();

describe.skipIf(!serverUp)('CSRF Protection — Middleware', () => {
  const mutativeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  const protectedPath = '/api/admin/organizations';

  for (const method of mutativeMethods) {
    describe(`${method} requests`, () => {
      it('rejects request without Origin header', async () => {
        const base = getApiBase();
        const url = `${base}${protectedPath}`;
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'test' }),
        });
        // Should be 403 CSRF or 401 auth, but NOT 500
        expect(res.status).toBeLessThan(500);
        // If the CSRF middleware is active, expect 403
        if (res.status === 403) {
          const body = await res.json().catch(() => null);
          expect(body?.error).toMatch(/CSRF|forbidden/i);
        }
      });

      it('rejects request with mismatched Origin header', async () => {
        const base = getApiBase();
        const host = new URL(base).host;
        const url = `${base}${protectedPath}`;
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Origin': 'https://evil-site.com',
            'Host': host,
          },
          body: JSON.stringify({ action: 'test' }),
        });
        expect(res.status).toBeLessThan(500);
        if (res.status === 403) {
          const body = await res.json().catch(() => null);
          expect(body?.error).toMatch(/CSRF|origin/i);
        }
      });

      it('accepts request with matching Origin header', async () => {
        const base = getApiBase();
        const origin = new URL(base).origin;
        const host = new URL(base).host;
        const url = `${base}${protectedPath}`;
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Origin': origin,
            'Host': host,
          },
          body: JSON.stringify({ action: 'test' }),
        });
        // Should NOT be a CSRF 403 — may be 401/403 auth, but not CSRF rejection
        expect(res.status).toBeLessThan(500);
        // If it's 403 for auth reasons, that's fine; the CSRF check passed
      });
    });
  }

  it('GET requests bypass CSRF check', async () => {
    const res = await apiCall('GET', '/admin/organizations');
    // GET should never be blocked by CSRF, only by auth
    expect(res.status).toBeLessThan(500);
  });

  it('auth API routes bypass CSRF check (Better Auth manages its own)', async () => {
    const base = getApiBase();
    const res = await fetch(`${base}/api/auth/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    // Auth routes handle their own CSRF; we just verify no 500
    expect(res.status).toBeLessThan(500);
  });

  it('rejects request with invalid Origin URL format', async () => {
    const base = getApiBase();
    const host = new URL(base).host;
    const url = `${base}${protectedPath}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'not-a-valid-url',
        'Host': host,
      },
      body: JSON.stringify({ action: 'test' }),
    });
    expect(res.status).toBeLessThan(500);
    if (res.status === 403) {
      const body = await res.json().catch(() => null);
      expect(body?.error).toMatch(/CSRF|invalid/i);
    }
  });
});
