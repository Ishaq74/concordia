/**
 * Database migration & schema validation tests.
 * Ensures all 18 schema tables are created, columns exist, and migrations are idempotent.
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { getTestDb } from '@tests/config/test-db'
import { sql } from 'drizzle-orm'
import {
  user, session, account, verification, organization, member, invitation,
  blogPosts, blogAuthors, blogCategories, blogComments, blogMedia, blogOrganizations, blogTranslations,
  profile,
  servicesListings, servicesCategories, servicesBookings, servicesMedia,
  servicesAvailability, servicesTranslations, servicesReviews,
  notification,
} from '@database/schemas'

// Map of table export name → expected SQL table name
const expectedTables: Record<string, string> = {
  user: 'user',
  session: 'session',
  account: 'account',
  verification: 'verification',
  organization: 'organization',
  member: 'member',
  invitation: 'invitation',
  profile: 'profile',
  blogPosts: 'blog_posts',
  blogAuthors: 'blog_authors',
  blogCategories: 'blog_categories',
  blogComments: 'blog_comments',
  blogMedia: 'blog_media',
  blogOrganizations: 'blog_organizations',
  blogTranslations: 'blog_translations',
  notification: 'notification',
  servicesListings: 'services_listings',
  servicesCategories: 'services_categories',
  servicesBookings: 'services_bookings',
  servicesMedia: 'services_media',
  servicesAvailability: 'services_availability',
  servicesTranslations: 'services_translations',
  servicesReviews: 'services_reviews',
}

describe('Database Schema Validation', () => {
  let db: Awaited<ReturnType<typeof getTestDb>>

  beforeAll(async () => {
    db = await getTestDb()
  })

  it('all expected tables exist in the test database', async () => {
    const result = await db.execute(
      sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    )
    const tableNames = (result as { rows: { table_name: string }[] }).rows
      ? (result as { rows: { table_name: string }[] }).rows.map((r) => r.table_name)
      : (result as unknown as { table_name: string }[]).map((r) => r.table_name)

    for (const [, tableName] of Object.entries(expectedTables)) {
      expect(tableNames, `Table "${tableName}" should exist`).toContain(tableName)
    }
  })

  it('user table has essential auth columns', async () => {
    const result = await db.execute(
      sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'user'`
    )
    const columns = (result as { rows: { column_name: string }[] }).rows
      ? (result as { rows: { column_name: string }[] }).rows.map((r) => r.column_name)
      : (result as unknown as { column_name: string }[]).map((r) => r.column_name)

    for (const col of ['id', 'email', 'name', 'role', 'created_at']) {
      expect(columns, `user.${col} should exist`).toContain(col)
    }
  })

  it('profile table has expected columns', async () => {
    const result = await db.execute(
      sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'profile'`
    )
    const columns = (result as { rows: { column_name: string }[] }).rows
      ? (result as { rows: { column_name: string }[] }).rows.map((r) => r.column_name)
      : (result as unknown as { column_name: string }[]).map((r) => r.column_name)

    for (const col of ['id', 'user_id', 'full_name', 'bio', 'preferred_language']) {
      expect(columns, `profile.${col} should exist`).toContain(col)
    }
  })

  it('blog_comments table has moderation columns', async () => {
    const result = await db.execute(
      sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'blog_comments'`
    )
    const columns = (result as { rows: { column_name: string }[] }).rows
      ? (result as { rows: { column_name: string }[] }).rows.map((r) => r.column_name)
      : (result as unknown as { column_name: string }[]).map((r) => r.column_name)

    for (const col of ['id', 'post_id', 'status', 'author_email', 'content']) {
      expect(columns, `blog_comments.${col} should exist`).toContain(col)
    }
  })

  it('services_bookings table has booking columns', async () => {
    const result = await db.execute(
      sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'services_bookings'`
    )
    const columns = (result as { rows: { column_name: string }[] }).rows
      ? (result as { rows: { column_name: string }[] }).rows.map((r) => r.column_name)
      : (result as unknown as { column_name: string }[]).map((r) => r.column_name)

    for (const col of ['id', 'service_id', 'customer_id', 'provider_id', 'status', 'booking_date']) {
      expect(columns, `services_bookings.${col} should exist`).toContain(col)
    }
  })

  it('schema exports are valid drizzle table objects', () => {
    const tables = [
      user, session, account, verification, organization, member,
      blogPosts, blogAuthors, blogCategories, blogComments, blogMedia, blogOrganizations,
      profile, notification,
      servicesListings, servicesCategories, servicesBookings, servicesMedia, servicesAvailability,
    ]

    for (const table of tables) {
      // Drizzle tables have a Symbol-based key; checking for basic shape
      expect(table).toBeDefined()
      expect(typeof table).toBe('object')
    }
  })

  it('migration is idempotent (running getTestDb twice does not throw)', async () => {
    // getTestDb applies migrations — calling it again should not fail
    const db2 = await getTestDb()
    expect(db2).toBeDefined()
  })
})
