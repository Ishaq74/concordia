import { getTestDb } from '../config/test-db';

/**
 * Execute a callback inside a database transaction which is rolled back when
 * the callback completes (even if it throws). This allows tests to make
 * arbitrary modifications without needing to truncate the entire schema.
 *
 * **When to use:**
 * - Tests that only use direct Drizzle `db.insert()` / `db.update()` / `db.delete()`.
 * - Fast, isolated DB tests where you want automatic rollback.
 *
 * **When NOT to use (prefer cleanupTestData instead):**
 * - Tests that use Better Auth's `test.saveUser()` / `test.saveOrganization()` —
 *   these use a separate connection that won't share the transaction.
 * - Tests that call API endpoints via `apiCall()` — the server uses its own DB connection.
 *
 * Usage:
 *
 * ```ts
 * import { withTestTransaction } from '@tests/utils/transaction';
 *
 * it('can run in a transaction', async () => {
 *   await withTestTransaction(async (db) => {
 *     await db.insert(users).values({ ... });
 *     // assertions
 *   });
 *   // at this point all changes have been rolled back automatically
 * });
 * ```
 */
export async function withTestTransaction<T>(cb: (db: any) => Promise<T>): Promise<T> {
  const db = await getTestDb();
  // drizzle exposes `client` with a `query` method; we rely on that here.
  const client = (db as any).client;
  if (!client || typeof client.query !== 'function') {
    throw new Error('Unable to obtain raw client for transactions');
  }

  try {
    await client.query('BEGIN');
    const result = await cb(db);
    await client.query('ROLLBACK');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
}
