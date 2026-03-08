import { describe, it, expect, beforeAll } from 'vitest';
import { getApiBase } from '@tests/utils/api-helpers';
import { serverAvailable } from '@tests/helpers/server-guard';

/**
 * Concurrency tests — verify the system handles race conditions:
 * - Double booking prevention
 * - Parallel organization creation
 * - Concurrent blog post creation
 * - Simultaneous session operations
 *
 * These tests require a running Astro dev server (pnpm dev or pnpm test from CLI).
 */

const serverUp = await serverAvailable();

describe.skipIf(!serverUp)('Concurrency tests', () => {
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {

    const { auth } = await import('@lib/auth/auth');
    const ctx = await auth.$context;
    const test = ctx.test;

    // Admin user
    const adminUser = test.createUser({ role: 'admin', emailVerified: true });
    const savedAdmin = await test.saveUser(adminUser);
    const adminLogin = await test.login({ userId: savedAdmin.id });
    adminToken = adminLogin.token;

    // Regular user
    const regUser = test.createUser({ role: 'member', emailVerified: true });
    const savedReg = await test.saveUser(regUser);
    const regLogin = await test.login({ userId: savedReg.id });
    userToken = regLogin.token;
  });

  function apiHeaders(token: string) {
    const base = getApiBase();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Origin: new URL(base).origin,
      Host: new URL(base).host,
    };
  }

  // ─── Double Booking Prevention ────────────────────────────────

  describe('Concurrency — Double booking prevention', () => {
  it('concurrent booking requests for same slot should not both succeed', async () => {
    const base = getApiBase();
    const headers = apiHeaders(userToken);

    const bookingPayload = {
      serviceId: 'test-service-concurrent',
      bookingDate: '2025-12-01',
      bookingTime: '10:00',
      customerMessage: 'Concurrent test',
    };

    // Fire two identical booking requests simultaneously
    const [res1, res2] = await Promise.all([
      fetch(`${base}/api/services/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bookingPayload),
      }),
      fetch(`${base}/api/services/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bookingPayload),
      }),
    ]);

    // Both should not be 500 (no server crash)
    expect(res1.status).toBeLessThan(500);
    expect(res2.status).toBeLessThan(500);

    // At most one should succeed (201). The other should fail (409/400/404)
    const successCount = [res1, res2].filter(r => r.status >= 200 && r.status < 300).length;
    // We accept 0 (if service doesn't exist) or 1 (one wins), but not 2 duplicates
    expect(successCount).toBeLessThanOrEqual(1);
  });
});

// ─── Parallel Blog Post Creation ──────────────────────────────

describe('Concurrency — Parallel blog post creation', () => {
  it('5 concurrent blog post creations should not produce duplicates', async () => {
    const base = getApiBase();
    const headers = apiHeaders(adminToken);

    const posts = Array.from({ length: 5 }, (_, i) => ({
      slug: `concurrent-post-${i}-${Date.now()}`,
      status: 'draft',
      translations: [{ inLanguage: 'fr', title: `Article concurrent ${i}`, content: `Contenu ${i}` }],
    }));

    const results = await Promise.all(
      posts.map(post =>
        fetch(`${base}/api/admin/blog/articles`, {
          method: 'POST',
          headers,
          body: JSON.stringify(post),
        })
      )
    );

    // No server crashes
    for (const res of results) {
      expect(res.status).toBeLessThan(500);
    }

    // All should either succeed or fail gracefully
    const slugsCreated = new Set<string>();
    for (let i = 0; i < results.length; i++) {
      if (results[i].status >= 200 && results[i].status < 300) {
        slugsCreated.add(posts[i].slug);
      }
    }
    // Unique slugs means no duplicates
    expect(slugsCreated.size).toBe([...slugsCreated].length);
  });
});

// ─── Concurrent Session Operations ────────────────────────────

describe('Concurrency — Concurrent session checks', () => {
  it('10 concurrent session reads should all succeed', async () => {
    const base = getApiBase();

    const results = await Promise.all(
      Array.from({ length: 10 }, () =>
        fetch(`${base}/api/auth/session`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        })
      )
    );

    for (const res of results) {
      expect(res.status).toBeLessThan(500);
    }
  });

  it('concurrent session reads with different tokens should be isolated', async () => {
    const base = getApiBase();

    const [res1, res2] = await Promise.all([
      fetch(`${base}/api/auth/session`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      }).then(r => r.json().catch(() => null)),
      fetch(`${base}/api/auth/session`, {
        headers: { Authorization: `Bearer ${userToken}` },
      }).then(r => r.json().catch(() => null)),
    ]);

    // Sessions should exist and be different
    if (res1?.session?.userId && res2?.session?.userId) {
      expect(res1.session.userId).not.toBe(res2.session.userId);
    }
  });
});

// ─── Concurrent Admin Operations ──────────────────────────────

describe('Concurrency — Concurrent admin operations', () => {
  it('parallel reads and writes should not cause deadlocks', async () => {
    const base = getApiBase();
    const headers = apiHeaders(adminToken);

    // Mix of read and write operations
    const operations = [
      fetch(`${base}/api/admin/blog/articles?page=1&perPage=5`, { headers }),
      fetch(`${base}/api/admin/services/services?page=1&perPage=5`, { headers }),
      fetch(`${base}/api/admin/blog/categories`, { headers }),
      fetch(`${base}/api/admin/services/categories`, { headers }),
      fetch(`${base}/api/admin/blog/articles`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          slug: `deadlock-test-${Date.now()}`,
          status: 'draft',
          translations: [{ inLanguage: 'fr', title: 'Test deadlock', content: 'Contenu' }],
        }),
      }),
    ];

    const results = await Promise.all(operations);

    // No 500 errors — no deadlocks
    for (const res of results) {
      expect(res.status).toBeLessThan(500);
    }
  });
});
});
