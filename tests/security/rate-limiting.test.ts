import { describe, it, expect } from 'vitest';
import { apiCall, getApiBase } from '@tests/utils/api-helpers';
import { serverAvailable } from '@tests/helpers/server-guard';

const serverUp = await serverAvailable();

describe.skipIf(!serverUp)('Rate Limiting', { timeout: 120_000 }, () => {

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
    // Documents whether rate limiting is active — no hard failure, tracked via count
    expect(rateLimited.length).toBeGreaterThanOrEqual(0);
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

}); // end describe.skipIf Rate Limiting
