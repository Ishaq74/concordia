// src/lib/database/drizzle.ts
import { config } from 'dotenv';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Client, Pool, type PoolClient } from 'pg';
import * as schema from './schemas';

config();

// ✅ Choix dynamique de la DB
let _url: string | undefined;
if (process.env.USE_PROD_DB === 'true') {
  _url = process.env.DATABASE_URL_PROD;
} else if (process.env.USE_DB_TEST === 'true') {
  _url = process.env.DATABASE_URL_TEST;
} else {
  _url = process.env.DATABASE_URL_LOCAL;
}

if (!_url) throw new Error('DATABASE_URL manquant pour l’environnement courant');

// ✅ Forcer TypeScript à comprendre que url est défini
const url: string = _url;

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
      const client: PoolClient = await Promise.race([
        pool.connect(),
        new Promise<PoolClient>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout PG')), 5000)
        ),
      ]);
      client.release();

      cachedDrizzle = drizzle(pool, { schema }) as DrizzleDB;
      return cachedDrizzle;
    } catch (e) {
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

// 👇 fonction utilitaire pour loguer l’environnement courant
export function getDbLabel() {
  if (process.env.USE_PROD_DB === 'true') return 'PROD';
  if (process.env.USE_DB_TEST === 'true') return 'TEST';
  return 'LOCAL';
}
