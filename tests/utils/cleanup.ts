import { getTestDb } from '../config/test-db'
import { eq, sql } from 'drizzle-orm'
import {
  user,
  session,
  account,
  verification,
  organization,
  member,
} from '@database/schemas'

export async function cleanupTestData(): Promise<{
  users: number
  sessions: number
  orgs: number
}> {
  try {
    const db = await getTestDb()
    const stats = { users: 0, sessions: 0, orgs: 0 }

    // Récupérer tous les utilisateurs de test
    const testUsers = await db
      .select({ id: user.id })
      .from(user)
      .where(sql`${user.email} LIKE '%@test.local'`)

    for (const { id } of testUsers) {
      // Supprimer les données liées
      await db.delete(session).where(eq(session.userId, id))
      await db.delete(account).where(eq(account.userId, id))
      await db.delete(member).where(eq(member.userId, id))
      await db.delete(verification).where(eq(verification.identifier, id))

      // Supprimer l'utilisateur
      await db.delete(user).where(eq(user.id, id))
      stats.users++
    }

    // Cleanup organisations orphelines
    const orphanedOrgs = await db.select({ id: organization.id }).from(organization)

    for (const { id: orgId } of orphanedOrgs) {
      const hasMembers = await db
        .select({ id: member.id })
        .from(member)
        .where(eq(member.organizationId, orgId))
        .limit(1)

      if (hasMembers.length === 0) {
        await db.delete(organization).where(eq(organization.id, orgId))
        stats.orgs++
      }
    }

    return stats
  } catch (error) {
    console.error('Cleanup error:', error)
    return { users: 0, sessions: 0, orgs: 0 }
  }
}
