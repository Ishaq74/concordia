/**
 * Single source of truth for database URL resolution.
 * Used by: drizzle.ts, drizzle configs, test helpers.
 *
 * Resolution order (via .env flags):
 *   USE_PROD_DB=true  → DATABASE_URL_PROD
 *   USE_DB_TEST=true  → DATABASE_URL_TEST
 *   default           → DATABASE_URL_LOCAL
 */
import { config } from 'dotenv';
config();

export type DbEnv = 'PROD' | 'TEST' | 'LOCAL';

/** Determine which DB environment is active based on .env flags. */
export function getDbEnv(): DbEnv {
  if (process.env.USE_PROD_DB === 'true') return 'PROD';
  if (process.env.USE_DB_TEST === 'true') return 'TEST';
  return 'LOCAL';
}

/** Resolve the DB connection URL for a given (or current) environment. */
export function getDbUrl(env?: DbEnv): string {
  const target = env ?? getDbEnv();
  switch (target) {
    case 'PROD': return process.env.DATABASE_URL_PROD || '';
    case 'TEST': return process.env.DATABASE_URL_TEST || '';
    case 'LOCAL': return process.env.DATABASE_URL_LOCAL || '';
  }
}
