import { drizzle } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'
import * as schema from '@database/schemas'
import { newDb } from 'pg-mem'
import fs from 'fs'
import path from 'path'

let dbClient: Client | null = null
let db: any = null

export async function getTestDb() {
  if (!db) {
    const connectionString = process.env.DATABASE_URL_TEST || ''

    if (!connectionString) {
      // Fallback to pg‑mem in-memory DB when no TEST URL provided
      const mem = newDb()
      // register minimal pg functions used by migrations (if any)
      const adapter = mem.adapters.createPg()
      dbClient = new adapter.Client()
      await dbClient.connect()

      // Wrap query to strip unsupported options (pg-mem doesn't support rowMode)
      const origQuery = (dbClient as any).query.bind(dbClient)
      ;(dbClient as any).query = (...args: any[]) => {
        // Strip rowMode from any object-style arg (defensive)
        for (let i = 0; i < args.length; i++) {
          if (typeof args[i] === 'object' && args[i] && 'rowMode' in args[i]) {
            const opts = { ...args[i] }
            delete opts.rowMode
            args[i] = opts
          }
        }

        try {
          return origQuery(...args)
        } catch (err: any) {
          // Some driver paths still forward rowMode in nested structures —
          // retry after removing any rowMode keys if error indicates that.
          if (err && /rowMode/i.test(String(err.message || err))) {
            for (let i = 0; i < args.length; i++) {
              if (typeof args[i] === 'object' && args[i] && 'rowMode' in args[i]) {
                const opts = { ...args[i] }
                delete opts.rowMode
                args[i] = opts
              }
            }
            return origQuery(...args)
          }
          throw err
        }
      }

      db = drizzle(dbClient, { schema })

      // Apply SQL migrations from src/database/migrations for parity
      const migrationsDir = path.resolve(process.cwd(), 'src', 'database', 'migrations')
      if (fs.existsSync(migrationsDir)) {
        const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()
        for (const file of files) {
          const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
          if (sql.trim()) {
            // pg-mem supports multiple statements
            await dbClient.query(sql)
          }
        }
      }
    } else {
      dbClient = new Client({ connectionString })
      await dbClient.connect()
      db = drizzle(dbClient, { schema })
    }
  }
  return db
}

export async function closeTestDb() {
  if (dbClient) {
    await dbClient.end()
    dbClient = null
    db = null
  }
}
