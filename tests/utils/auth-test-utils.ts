import { randomUUID, createHash } from 'crypto'
import { getAuth } from '@/lib/auth/auth'
import { getTestDb } from '../config/test-db'
import {
  user,
  session,
  organization,
  member,
  verification,
} from '@database/schemas'
import { eq } from 'drizzle-orm'

const usedEmails = new Set<string>()
const usedUsernames = new Set<string>()

export function generateTestEmail(prefix = 'test'): string {
  return `${prefix}-${randomUUID()}@test.local`
}

export function generateTestUsername(): string {
  return `u_${randomUUID().replace(/-/g, '').slice(0, 16)}`
}

export function generateSecurePassword(): string {
  return `P${randomUUID().replace(/-/g, '').slice(0, 15)}!@#`
}

export function generateUniqueEmail(prefix = 'test'): string {
  let email: string
  let attempts = 0
  do {
    email = generateTestEmail(prefix)
    attempts++
    if (attempts > 100) throw new Error('Cannot generate unique email')
  } while (usedEmails.has(email))
  usedEmails.add(email)
  return email
}

export function generateUniqueUsername(): string {
  let username: string
  let attempts = 0
  do {
    username = generateTestUsername()
    attempts++
    if (attempts > 100) throw new Error('Cannot generate unique username')
  } while (usedUsernames.has(username))
  usedUsernames.add(username)
  return username
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

export async function createTestUser(options: {
  email?: string
  password?: string
  username?: string
  name?: string
  emailVerified?: boolean
  role?: string
  organizationId?: string
}) {
  const email = options.email || generateUniqueEmail()
  const password = options.password || generateSecurePassword()
  const username = options.username || generateUniqueUsername()

  try {
    const auth = await getAuth()
    const db = await getTestDb()

    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: options.name || username,
        username,
      },
    })

    if (!result.user?.id) throw new Error('User creation failed')

    if (options.emailVerified) {
      await db
        .update(user)
        .set({ emailVerified: true })
        .where(eq(user.id, result.user.id))
    }

    if (options.organizationId) {
      await db.insert(member).values({
        id: randomUUID(),
        userId: result.user.id,
        organizationId: options.organizationId,
        role: options.role || 'member',
        createdAt: new Date(),
      })
    }

    return {
      ...result,
      credentials: { email, password, username },
    }
  } catch (error) {
    console.error('createTestUser error:', error)
    throw error
  }
}

export async function loginTestUser(email: string, password: string) {
  try {
    const auth = await getAuth()
    const startTime = Date.now()

    const result = await auth.api.signInEmail({
      body: { email, password },
    })

    const endTime = Date.now()

    if (endTime - startTime < 50) {
      console.warn('⚠️ Timing attack possible: login too fast')
    }

    if (!result.token) throw new Error('No token returned')

    return {
      ...result,
      timing: endTime - startTime,
    }
  } catch (error) {
    console.error('loginTestUser error:', error)
    throw error
  }
}

export async function createTestOrganization(ownerId: string, name?: string) {
  try {
    const db = await getTestDb()
    const orgId = randomUUID()

    await db.insert(organization).values({
      id: orgId,
      name: name || `Org-${randomUUID().slice(0, 8)}`,
      slug: `org-${randomUUID().slice(0, 8)}`,
      createdAt: new Date(),
    })

    await db.insert(member).values({
      id: randomUUID(),
      userId: ownerId,
      organizationId: orgId,
      role: 'owner',
      createdAt: new Date(),
    })

    return orgId
  } catch (error) {
    console.error('createTestOrganization error:', error)
    throw error
  }
}

export async function clearTestData() {
  usedEmails.clear()
  usedUsernames.clear()
}
