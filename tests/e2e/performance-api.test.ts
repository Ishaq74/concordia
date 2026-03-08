import { describe, it, expect, beforeAll } from 'vitest';
import { auth } from '@lib/auth/auth';
import type { TestHelpers } from 'better-auth/plugins';
import { getApiBase } from '@tests/utils/api-helpers';

/**
 * Performance API tests — measure response times for key endpoints,
 * detect N+1 queries, and validate pagination behavior.
 */

let adminToken: string;

beforeAll(async () => {
  const ctx = await auth.$context;
  const test = ctx.test;
  const adminUser = test.createUser({ role: 'admin', emailVerified: true });
  const user = await test.saveUser(adminUser);
  const login = await test.login({ userId: user.id });
  adminToken = login.token;
});

// ─── Response Time Thresholds ─────────────────────────────────

const RESPONSE_TIME_LIMITS = {
  auth: 2000,     // Auth endpoints: 2s max
  api: 3000,      // Admin API endpoints: 3s max
  public: 2000,   // Public pages: 2s max
  static: 500,    // Static assets: 500ms max
};

async function measureResponseTime(url: string, options?: RequestInit): Promise<{ status: number; ms: number }> {
  const start = performance.now();
  const res = await fetch(url, options);
  const ms = performance.now() - start;
  return { status: res.status, ms };
}

describe('Performance — Auth endpoints', () => {
  const base = getApiBase();

  it('GET /api/auth/session responds within threshold', async () => {
    const { status, ms } = await measureResponseTime(`${base}/api/auth/session`);
    expect(status).toBeLessThan(500);
    expect(ms).toBeLessThan(RESPONSE_TIME_LIMITS.auth);
  });

  it('POST /api/auth/sign-in/email responds within threshold', async () => {
    const { status, ms } = await measureResponseTime(`${base}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: new URL(base).origin,
        Host: new URL(base).host,
      },
      body: JSON.stringify({ email: 'perf@test.com', password: 'PerfTest123!' }),
    });
    expect(status).toBeLessThan(500);
    expect(ms).toBeLessThan(RESPONSE_TIME_LIMITS.auth);
  });
});

describe('Performance — Admin API endpoints', () => {
  const base = getApiBase();
  const origin = new URL(base).origin;
  const host = new URL(base).host;

  const adminEndpoints = [
    '/api/admin/blog/articles?page=1&perPage=20',
    '/api/admin/services/services?page=1&perPage=20',
    '/api/admin/services/categories',
    '/api/admin/blog/categories',
    '/api/admin/blog/authors',
  ];

  for (const endpoint of adminEndpoints) {
    it(`GET ${endpoint} responds within threshold`, async () => {
      const { status, ms } = await measureResponseTime(`${base}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          Origin: origin,
          Host: host,
        },
      });
      expect(status).toBeLessThan(500);
      expect(ms).toBeLessThan(RESPONSE_TIME_LIMITS.api);
    });
  }
});

describe('Performance — Public pages', () => {
  const base = getApiBase();

  const publicPages = [
    '/fr/',
    '/en/',
    '/fr/blog',
    '/fr/services',
    '/api/auth/session',
  ];

  for (const page of publicPages) {
    it(`GET ${page} responds within threshold`, async () => {
      const { status, ms } = await measureResponseTime(`${base}${page}`);
      expect(status).toBeLessThan(500);
      expect(ms).toBeLessThan(RESPONSE_TIME_LIMITS.public);
    });
  }
});

// ─── Pagination Performance ───────────────────────────────────

describe('Performance — Pagination does not degrade', () => {
  const base = getApiBase();
  const origin = new URL(base).origin;
  const host = new URL(base).host;

  it('page 1 vs page 10 should have similar response times', async () => {
    const headers = {
      Authorization: `Bearer ${adminToken}`,
      Origin: origin,
      Host: host,
    };

    const { ms: ms1 } = await measureResponseTime(`${base}/api/admin/blog/articles?page=1&perPage=20`, { headers });
    const { ms: ms10 } = await measureResponseTime(`${base}/api/admin/blog/articles?page=10&perPage=20`, { headers });

    // Page 10 should not be more than 3x slower than page 1
    expect(ms10).toBeLessThan(ms1 * 3 + 500);
  });

  it('small vs large page size should be bounded', async () => {
    const headers = {
      Authorization: `Bearer ${adminToken}`,
      Origin: origin,
      Host: host,
    };

    const { ms: msSmall } = await measureResponseTime(`${base}/api/admin/blog/articles?page=1&perPage=5`, { headers });
    const { ms: msLarge } = await measureResponseTime(`${base}/api/admin/blog/articles?page=1&perPage=100`, { headers });

    // Large page should not be more than 5x slower
    expect(msLarge).toBeLessThan(msSmall * 5 + 1000);
  });
});

// ─── Concurrent Request Handling ──────────────────────────────

describe('Performance — Concurrent request handling', () => {
  const base = getApiBase();

  it('handles 10 concurrent public page requests without errors', async () => {
    const requests = Array.from({ length: 10 }, () =>
      measureResponseTime(`${base}/fr/`)
    );

    const results = await Promise.all(requests);
    const errors = results.filter(r => r.status >= 500);
    expect(errors.length).toBe(0);

    const avgMs = results.reduce((sum, r) => sum + r.ms, 0) / results.length;
    expect(avgMs).toBeLessThan(RESPONSE_TIME_LIMITS.public * 2);
  });

  it('handles 10 concurrent API requests without errors', async () => {
    const headers = {
      Authorization: `Bearer ${adminToken}`,
      Origin: new URL(base).origin,
      Host: new URL(base).host,
    };

    const requests = Array.from({ length: 10 }, () =>
      measureResponseTime(`${base}/api/admin/blog/articles?page=1&perPage=5`, { headers })
    );

    const results = await Promise.all(requests);
    const errors = results.filter(r => r.status >= 500);
    expect(errors.length).toBe(0);
  });
});
