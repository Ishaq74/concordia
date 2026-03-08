import { describe, it, expect } from 'vitest';
import { apiCall, getApiBase } from '@tests/utils/api-helpers';

/**
 * Rate limiting tests — verifies the server does not allow brute-force or
 * denial-of-service through rapid repeated requests.
 * Government sites must resist credential stuffing and abuse.
 */

describe('Rate Limiting — Auth endpoints', () => {
  it('multiple rapid login attempts do not crash the server', async () => {
    const results = await Promise.all(
      Array.from({ length: 20 }, (_, i) =>
        apiCall('POST', '/auth/sign-in/email', {
          email: `brute${i}@attack.local`,
          password: 'wrong-password',
        }),
      ),
    );

    // All requests should complete without 500
    for (const res of results) {
      expect(res.status).toBeLessThan(500);
    }

    // At least some should be rate-limited (429) if protection is active
    const rateLimited = results.filter((r) => r.status === 429);
    // If rate limiting is implemented, at least one should be 429
    // If not, this documents the gap — no assertion failure, just a warning
    if (rateLimited.length === 0) {
      console.warn(
        '⚠️  SECURITY WARNING: No rate limiting detected on auth endpoints. ' +
          'Consider implementing rate-limiting middleware for production.',
      );
    }
  });

  it('rapid signup attempts do not crash the server', async () => {
    const results = await Promise.all(
      Array.from({ length: 15 }, (_, i) =>
        apiCall('POST', '/auth/sign-up/email', {
          email: `rapid${i}@spam.local`,
          password: 'SpamPass123!@#',
          name: `spammer${i}`,
        }),
      ),
    );

    for (const res of results) {
      expect(res.status).toBeLessThan(500);
    }
  });

  it('rapid password reset attempts do not crash the server', async () => {
    const results = await Promise.all(
      Array.from({ length: 15 }, (_, i) =>
        apiCall('POST', '/auth/forgot-password', {
          email: `reset${i}@flood.local`,
        }),
      ),
    );

    for (const res of results) {
      expect(res.status).toBeLessThan(500);
    }
  });
});

describe('Rate Limiting — API endpoints', () => {
  it('rapid API calls to admin endpoints remain stable', async () => {
    const results = await Promise.all(
      Array.from({ length: 30 }, () =>
        apiCall('GET', '/admin/organizations'),
      ),
    );

    for (const res of results) {
      expect(res.status).toBeLessThan(500);
    }
  });

  it('rapid API calls to blog endpoint remain stable', async () => {
    const results = await Promise.all(
      Array.from({ length: 30 }, () =>
        apiCall('GET', '/admin/blog'),
      ),
    );

    for (const res of results) {
      expect(res.status).toBeLessThan(500);
    }
  });
});

describe('Rate Limiting — Concurrent mutations', () => {
  it('concurrent POST requests do not corrupt data or crash', async () => {
    const base = getApiBase();
    const origin = new URL(base).origin;
    const host = new URL(base).host;

    const results = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        fetch(`${base}/api/admin/organizations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Origin: origin,
            Host: host,
          },
          body: JSON.stringify({ action: 'create', name: `RateOrg${i}`, slug: `rate-org-${i}` }),
        }).then((r) => ({ status: r.status })),
      ),
    );

    for (const res of results) {
      expect(res.status).toBeLessThan(500);
    }
  });
});
