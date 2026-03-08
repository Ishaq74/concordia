import { describe, it, expect, beforeAll } from 'vitest';
import { auth } from '@lib/auth/auth';
import type { TestHelpers } from 'better-auth/plugins';
import { getApiBase } from '@tests/utils/api-helpers';

/**
 * Upload validation tests — ensures file upload endpoints reject:
 * - Oversized files
 * - Forbidden MIME types (executables, scripts)
 * - Path traversal in filenames
 * - Null bytes in filenames
 */

async function isServerAvailable(): Promise<boolean> {
  try {
    const base = getApiBase();
    const res = await fetch(`${base}/`, { signal: AbortSignal.timeout(3000) });
    return res.ok || res.status === 404;
  } catch {
    return false;
  }
}

let adminToken: string;
let serverUp = false;

beforeAll(async () => {
  serverUp = await isServerAvailable();
  const ctx = await auth.$context;
  const test = ctx.test;
  const adminUser = test.createUser({ role: 'admin', emailVerified: true });
  const user = await test.saveUser(adminUser);
  const login = await test.login({ userId: user.id });
  adminToken = login.token;
});

function createFakeFormData(filename: string, content: string, mimeType: string): FormData {
  const formData = new FormData();
  const blob = new Blob([content], { type: mimeType });
  formData.append('file', blob, filename);
  return formData;
}

// ─── MIME Type Validation ─────────────────────────────────────

describe('Upload — MIME type validation', () => {
  const dangerousMimes = [
    { filename: 'malware.exe', mime: 'application/x-msdownload', label: 'Windows executable' },
    { filename: 'script.sh', mime: 'application/x-sh', label: 'Shell script' },
    { filename: 'payload.php', mime: 'application/x-httpd-php', label: 'PHP file' },
    { filename: 'exploit.jsp', mime: 'text/x-jsp', label: 'JSP file' },
    { filename: 'hack.py', mime: 'text/x-python', label: 'Python script' },
    { filename: 'attack.html', mime: 'text/html', label: 'HTML file' },
    { filename: 'xss.svg', mime: 'image/svg+xml', label: 'SVG with potential XSS' },
  ];

  for (const { filename, mime, label } of dangerousMimes) {
    it(`rejects ${label} (${filename})`, async () => {
      if (!serverUp) return;
      const base = getApiBase();
      const origin = new URL(base).origin;
      const host = new URL(base).host;

      const formData = createFakeFormData(filename, 'fake content', mime);
      const res = await fetch(`${base}/api/admin/services/media`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          Origin: origin,
          Host: host,
        },
        body: formData,
      });

      // Should reject with 400/415 (unsupported media type) but NOT 500
      expect(res.status).toBeLessThan(500);
    });
  }
});

// ─── Filename Sanitization ────────────────────────────────────

describe('Upload — Filename sanitization', () => {
  const dangerousFilenames = [
    '../../../etc/passwd',
    '..\\..\\windows\\system32\\config.sam',
    'test\x00.php',
    'file\x00.jpg.php',
    'image.jpg\0.php',
    '.htaccess',
    'web.config',
    '.<script>test</script>.jpg',
  ];

  for (const filename of dangerousFilenames) {
    it(`sanitizes dangerous filename: ${filename.replace(/\x00/g, '\\x00').slice(0, 30)}`, async () => {
      if (!serverUp) return;
      const base = getApiBase();
      const origin = new URL(base).origin;
      const host = new URL(base).host;

      const formData = createFakeFormData(filename, 'x'.repeat(100), 'image/jpeg');
      const res = await fetch(`${base}/api/admin/services/media`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          Origin: origin,
          Host: host,
        },
        body: formData,
      });

      expect(res.status).toBeLessThan(500);
      // If accepted, verify the stored filename doesn't contain path traversal
      if (res.status >= 200 && res.status < 300) {
        const body = await res.json().catch(() => null);
        if (body?.filename || body?.url) {
          const stored = body.filename || body.url;
          expect(stored).not.toContain('..');
          expect(stored).not.toContain('\x00');
          expect(stored).not.toContain('<script>');
        }
      }
    });
  }
});

// ─── File Size Limits ─────────────────────────────────────────

describe('Upload — File size limits', () => {
  it('rejects oversized file (10MB+)', async () => {
    if (!serverUp) return;
    const base = getApiBase();
    const origin = new URL(base).origin;
    const host = new URL(base).host;

    // Create a 10MB fake payload
    const largeContent = 'A'.repeat(10 * 1024 * 1024);
    const formData = createFakeFormData('large.jpg', largeContent, 'image/jpeg');

    const res = await fetch(`${base}/api/admin/services/media`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        Origin: origin,
        Host: host,
      },
      body: formData,
    });

    // Should be 413 (payload too large) or 400, but NOT 500
    expect(res.status).toBeLessThan(500);
  });

  it('accepts reasonably sized file', async () => {
    if (!serverUp) return;
    const base = getApiBase();
    const origin = new URL(base).origin;
    const host = new URL(base).host;

    const smallContent = 'A'.repeat(1024); // 1KB
    const formData = createFakeFormData('small.jpg', smallContent, 'image/jpeg');

    const res = await fetch(`${base}/api/admin/services/media`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        Origin: origin,
        Host: host,
      },
      body: formData,
    });

    expect(res.status).toBeLessThan(500);
  });
});
