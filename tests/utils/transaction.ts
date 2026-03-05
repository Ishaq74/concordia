import { getTestDb } from '../config/test-db';

/**
 * Execute a callback inside a database transaction which is rolled back when
 * the callback completes (even if it throws). This allows tests to make
 * arbitrary modifications without needing to truncate the entire schema.
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
 *
 * The current setup still calls `cleanupTestData()` in the global hooks, so
 * adopting transactions is optional but can significantly speed up suites
 * that create many rows.
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
