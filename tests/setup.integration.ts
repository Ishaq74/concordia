// tests/setup.integration.ts
//
// Shared helpers for integration tests that need Better Auth test utilities.
//
// Usage in test files:
//   import { getAuthTestHelpers } from '@tests/setup.integration'
//   const { test } = await getAuthTestHelpers()

import type { TestHelpers } from 'better-auth/plugins';

let _helpers: { test: TestHelpers } | null = null;

/**
 * Lazily initialise Better Auth test helpers. Returns cached instance on
 * subsequent calls. The `auth` import is mocked by setup.ts to use the test
 * database, so `auth.$context` resolves correctly.
 */
export async function getAuthTestHelpers(): Promise<{ test: TestHelpers }> {
  if (_helpers) return _helpers;
  const { auth } = await import('@lib/auth/auth');
  const ctx = await auth.$context;
  _helpers = { test: ctx.test };
  return _helpers;
}
