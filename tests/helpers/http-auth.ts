/**
 * HTTP-based auth helpers for integration tests that need to authenticate
 * against a running dev server. Uses real HTTP sign-up/sign-in + direct
 * DB manipulation for email verification and role assignment.
 *
 * These helpers are used when `serverAvailable()` is true, because the
 * Better Auth testUtils write to the test DB directly, but API calls go
 * to the dev server which also uses the test DB (when USE_DB_TEST=true).
 */
import { Client } from 'pg';
import { getApiBase } from '@tests/utils/api-helpers';
import { getDbUrl } from '@database/env';

let _sharedClient: Client | null = null;

/** Get or create a shared PG client for the dev DB. */
async function getDevDbClient(): Promise<Client> {
  if (_sharedClient) return _sharedClient;
  const url = getDbUrl();
  if (!url) throw new Error('No dev DB URL available for integration tests');
  _sharedClient = new Client({ connectionString: url });
  await _sharedClient.connect();
  return _sharedClient;
}

/** Close the shared PG client — call in afterAll(). */
export async function closeDevDb(): Promise<void> {
  if (_sharedClient) {
    await _sharedClient.end();
    _sharedClient = null;
  }
}

/** Track created user IDs for cleanup. */
const createdUserIds: string[] = [];

/**
 * Sign up a user via HTTP, verify their email in the DB, and sign in
 * to obtain a real Bearer token from the dev server.
 */
export async function httpCreateUserWithToken(
  opts: { role?: string } = {},
): Promise<{ userId: string; token: string }> {
  const base = getApiBase();
  const origin = new URL(base).origin;
  const host = new URL(base).host;
  const email = `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@integration.local`;
  const password = 'IntegTest_Pwd42!';

  // Clear rate-limit entries so test sign-up/sign-in aren't throttled
  const db = await getDevDbClient();
  try {
    await db.query('DELETE FROM "rate_limit"');
  } catch {
    // table may not exist — ignore
  }

  // 1. Sign up via HTTP (with retry on rate limit)
  let signUpRes: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    signUpRes = await fetch(`${base}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: origin, Host: host },
      body: JSON.stringify({ name: 'Integration Test User', email, password }),
    });
    if (signUpRes.status !== 429) break;
    try {
      await db.query('DELETE FROM "rate_limit"');
    } catch { /* ignore */ }
    await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
  }
  if (!signUpRes!.ok) {
    throw new Error(`HTTP sign-up failed: ${signUpRes!.status} ${await signUpRes!.text()}`);
  }
  const signUpData = await signUpRes!.json() as { user: { id: string } };
  const userId = signUpData.user.id;
  createdUserIds.push(userId);

  // 2. Verify email + set role directly in the dev DB
  const role = opts.role || 'user';
  await db.query(
    'UPDATE "user" SET "email_verified" = true, role = $1 WHERE id = $2',
    [role, userId],
  );

  // 3. Sign in via HTTP to get a real Bearer token
  // Clear rate limits again just before sign-in (parallel tests may have re-filled them)
  try {
    await db.query('DELETE FROM "rate_limit"');
  } catch {
    // ignore
  }

  let signInRes: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    signInRes = await fetch(`${base}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: origin, Host: host },
      body: JSON.stringify({ email, password }),
    });
    if (signInRes.status !== 429) break;
    // Rate limited — clear and retry
    try {
      await db.query('DELETE FROM "rate_limit"');
    } catch { /* ignore */ }
    await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
  }
  if (!signInRes!.ok) {
    throw new Error(`HTTP sign-in failed: ${signInRes!.status} ${await signInRes!.text()}`);  
  }
  const signInData = await signInRes!.json() as { token: string };
  if (!signInData.token) {
    throw new Error('HTTP sign-in returned no token — email verification may have failed');
  }

  return { userId, token: signInData.token };
}

/**
 * Sign up an admin user via HTTP and return a valid Bearer token.
 */
export async function httpCreateAdminWithToken(): Promise<{ userId: string; token: string }> {
  return httpCreateUserWithToken({ role: 'admin' });
}

/**
 * Clean up all users created by httpCreate*WithToken in the dev DB.
 * Call in afterAll() to leave the dev DB clean.
 */
export async function httpCleanupTestUsers(): Promise<void> {
  if (createdUserIds.length === 0) return;
  const db = await getDevDbClient();
  for (const userId of createdUserIds) {
    // Delete in dependency order
    for (const table of ['session', 'account', 'user_role', 'profile', 'wallet', 'audit_log']) {
      try {
        await db.query(`DELETE FROM "${table}" WHERE "user_id" = $1`, [userId]);
      } catch {
        // table may not exist or column may differ — ignore
      }
    }
    try {
      await db.query('DELETE FROM "user" WHERE id = $1', [userId]);
    } catch {
      // ignore
    }
  }
  createdUserIds.length = 0;
}

