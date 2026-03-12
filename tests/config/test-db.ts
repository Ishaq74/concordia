import { drizzle } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'
import * as schema from '@database/schemas'
import { getDbUrl } from '@database/env'

let dbClient: Client | null = null
let db: any = null

export async function getTestDb() {
  if (!db) {
    const connectionString = getDbUrl('TEST')
    if (!connectionString) {
      throw new Error(
        'DATABASE_URL_TEST is not set. All tests require a real PostgreSQL test database.\n' +
        'Set DATABASE_URL_TEST in your .env file (e.g. postgresql://postgres:password@localhost:5432/concordia_db_test)'
      )
    }

    dbClient = new Client({ connectionString })
    await dbClient.connect()
    db = drizzle(dbClient!, { schema })
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
