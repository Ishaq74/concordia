// src/database/drizzle.ts
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Client, Pool, type PoolClient } from 'pg';
import * as schema from './schemas';
import { getDbUrl, getDbEnv } from './env';

const url = getDbUrl();
if (!url) throw new Error(`DATABASE_URL manquant pour l'environnement ${getDbEnv()}`);

type DrizzleDB = NodePgDatabase<typeof schema>;

// 👇 fonction indispensable pour tes scripts
export function getPgClient() {
  return new Client({
    connectionString: url,
    ssl: url.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
  });
}

let cachedDrizzle: DrizzleDB | null = null;
let connecting: Promise<DrizzleDB> | null = null;

export async function getDrizzle(): Promise<DrizzleDB> {
  if (cachedDrizzle) return cachedDrizzle;
  if (connecting) return connecting;

  connecting = (async () => {
    const pool = new Pool({
      connectionString: url,
      ssl: url.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
      max: 5,
      idleTimeoutMillis: 10000,
    });

    try {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const client: PoolClient = await Promise.race([
        pool.connect(),
        new Promise<PoolClient>((_, reject) => {
          timer = setTimeout(() => reject(new Error('Timeout PG')), 5000);
        }),
      ]).finally(() => { if (timer) clearTimeout(timer); });
      client.release();

      cachedDrizzle = drizzle(pool, { schema }) as DrizzleDB;
      return cachedDrizzle;
    } catch (e) {
      await pool.end().catch(() => {});
      connecting = null;
      throw e;
    }
  })();

  try {
    return await connecting;
  } catch (e) {
    connecting = null;
    throw e;
  }
}

