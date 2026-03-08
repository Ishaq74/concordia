/**
 * Shared server-availability guard for integration/security tests that require
 * a running Astro dev server.
 *
 * Usage:
 *   import { serverAvailable, ensureServer } from '@tests/helpers/server-guard';
 *
 *   // Option 1: skip entire describe
 *   describe.runIf(await serverAvailable())('My tests', () => { ... });
 *
 *   // Option 2: skip individual tests
 *   it.runIf(serverUp)('test', async () => { ... });
 *
 * In CI these tests appear as SKIPPED (not green), giving clear signal that
 * the server wasn't available and the tests were not actually validated.
 */
import { getApiBase } from '@tests/utils/api-helpers';

let _checked = false;
let _available = false;

/**
 * Checks once whether the dev server is responding.
 * Caches the result for the lifetime of the test worker.
 */
export async function serverAvailable(): Promise<boolean> {
  if (_checked) return _available;
  _checked = true;
  try {
    const base = getApiBase();
    const res = await fetch(`${base}/`, { signal: AbortSignal.timeout(3000) });
    _available = res.ok || res.status === 404;
  } catch {
    _available = false;
  }
  return _available;
}
