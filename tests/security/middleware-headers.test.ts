import { describe, it, expect } from 'vitest';
import { apiCall } from '@tests/utils/api-helpers';

/**
 * Tests for security headers set by src/middleware.ts
 * Validates CSP, HSTS, X-Frame-Options, and other security headers
 * that a government site MUST enforce.
 */

describe('Security Headers — Middleware', () => {
  const testPaths = ['/api/auth/session', '/fr/', '/en/'];

  for (const path of testPaths) {
    describe(`Path: ${path}`, () => {
      it('sets Content-Security-Policy header', async () => {
        const res = await apiCall('GET', path);
        const csp = res.headers.get('content-security-policy');
        expect(csp).toBeTruthy();
        expect(csp).toContain("default-src 'self'");
        expect(csp).toContain("script-src 'self'");
        expect(csp).toContain("style-src 'self'");
        expect(csp).toContain("font-src 'self'");
        expect(csp).toContain("base-uri 'self'");
        expect(csp).toContain("form-action 'self'");
      });

      it('sets X-Content-Type-Options to nosniff', async () => {
        const res = await apiCall('GET', path);
        expect(res.headers.get('x-content-type-options')).toBe('nosniff');
      });

      it('sets X-XSS-Protection to 0 (modern approach)', async () => {
        const res = await apiCall('GET', path);
        expect(res.headers.get('x-xss-protection')).toBe('0');
      });

      it('sets Referrer-Policy', async () => {
        const res = await apiCall('GET', path);
        expect(res.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
      });

      it('sets Permissions-Policy', async () => {
        const res = await apiCall('GET', path);
        const pp = res.headers.get('permissions-policy');
        expect(pp).toBeTruthy();
        expect(pp).toContain('camera=()');
        expect(pp).toContain('microphone=()');
      });

      it('sets Strict-Transport-Security with long max-age', async () => {
        const res = await apiCall('GET', path);
        const hsts = res.headers.get('strict-transport-security');
        expect(hsts).toBeTruthy();
        expect(hsts).toContain('max-age=');
        expect(hsts).toContain('includeSubDomains');
        expect(hsts).toContain('preload');
        // min 2 years (63072000s)
        const maxAge = parseInt(hsts!.match(/max-age=(\d+)/)?.[1] ?? '0');
        expect(maxAge).toBeGreaterThanOrEqual(63072000);
      });

      it('sets Cross-Origin-Opener-Policy to same-origin', async () => {
        const res = await apiCall('GET', path);
        expect(res.headers.get('cross-origin-opener-policy')).toBe('same-origin');
      });

      it('sets Cross-Origin-Resource-Policy to same-origin', async () => {
        const res = await apiCall('GET', path);
        expect(res.headers.get('cross-origin-resource-policy')).toBe('same-origin');
      });
    });
  }

  it('CSP img-src allows data: and blob: for inline images', async () => {
    const res = await apiCall('GET', '/fr/');
    const csp = res.headers.get('content-security-policy');
    expect(csp).toContain('img-src');
    expect(csp).toContain('data:');
    expect(csp).toContain('blob:');
  });

  it('CSP connect-src restricts to self', async () => {
    const res = await apiCall('GET', '/fr/');
    const csp = res.headers.get('content-security-policy');
    expect(csp).toContain("connect-src 'self'");
  });
});
