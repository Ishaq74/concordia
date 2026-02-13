import { drizzle } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'
import * as schema from '@database/schemas'

let dbClient: Client | null = null
let db: any = null

export async function getTestDb() {
  if (!db) {
    const connectionString = process.env.DATABASE_URL_TEST || ''
    if (!connectionString) throw new Error('DATABASE_URL_TEST is not set')
    dbClient = new Client({ connectionString })
    await dbClient.connect()
    db = drizzle(dbClient, { schema })
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
