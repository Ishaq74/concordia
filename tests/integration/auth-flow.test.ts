import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getAuth } from '@/lib/auth/auth'
import { getTestDb } from '@tests/config/test-db'
import { TEST_ENV } from '@tests/config/test-env'
import { generateUniqueEmail, generateUniqueUsername, generateSecurePassword, createTestUser, loginTestUser, getAuditLogs } from '@tests/utils/auth-test-utils'
import { user, auditLog } from '@database/schemas'
import { eq } from 'drizzle-orm'

beforeEach(() => {
  Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value))
})

describe('Auth — critical integration tests', () => {
  it('sign-up creates user and audit log', async () => {
    const auth = await getAuth()
    const email = generateUniqueEmail('signup')
    const username = generateUniqueUsername()
    const password = generateSecurePassword()

    const res = await auth.api.signUpEmail({ body: { email, password, username, name: username } })
    expect(res.user).toBeDefined()
    const userId = (res.user as any).id
    expect(userId).toBeTruthy()

    const db = await getTestDb()

    // On vérifie uniquement la création de l'utilisateur et de l'audit log (pas de profile/wallet dans le schéma réel)
    const audits = await db.select().from(auditLog).where(eq(auditLog.userId, userId))
    const signupAudit = audits.find((a: any) => a.action === 'signup')
    expect(signupAudit).toBeDefined()
  })

  it('sign-in returns token for valid credentials', async () => {
    const created = await createTestUser({ email: generateUniqueEmail('signin'), password: generateSecurePassword(), username: generateUniqueUsername(), emailVerified: true })
    const creds = (created as any).credentials
    // debug: ensure the user exists in test DB before sign-in
    console.log('DEBUG: created.user.id =', (created as any).user?.id)
    const db = await getTestDb()
    const users = await db.select().from(user).where(eq(user.email, creds.email))
    console.log('DEBUG: users found for email', creds.email, users.map((u: { id: string }) => u.id))

    const result = await loginTestUser(creds.email, creds.password)
    expect(result.token).toBeDefined()
    expect(result.timing).toBeGreaterThanOrEqual(0)
  })

  it('sign-in with invalid password logs login_failed', async () => {
    const created = await createTestUser({ email: generateUniqueEmail('badpass'), password: generateSecurePassword(), username: generateUniqueUsername(), emailVerified: true })
    const creds = (created as any).credentials

    const auth = await getAuth()
    let failed: any
    try {
      failed = await auth.api.signInEmail({ body: { email: creds.email, password: 'wrong-password' } })
    } catch (err: any) {
      // better-auth may throw an APIError for invalid credentials — accept either behavior
      failed = err?.body || {}
    }

    // No token should be present on failed sign-in
    expect((failed as any).token).toBeUndefined()

    const audits = await getAuditLogs()
    const lastFailed = audits.reverse().find((a: any) => a.action === 'login_failed' && a.data?.email === creds.email)
    expect(lastFailed).toBeDefined()
  })

  it('duplicate sign-up is rejected', async () => {
    const auth = await getAuth()
    const email = generateUniqueEmail('dup')
    const username = generateUniqueUsername()
    const password = generateSecurePassword()

    await expect(auth.api.signUpEmail({ body: { email, password, username, name: username } })).resolves.not.toThrow()

    // second attempt should fail (duplicate email)
    await expect(auth.api.signUpEmail({ body: { email, password, username: username + '-2', name: username } })).rejects.toThrow()
  })
})
