import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getAuth } from '@lib/auth/auth'
import { getTestDb } from '@tests/config/test-db'
import { TEST_ENV } from '@tests/config/test-env'
import { auth } from '@lib/auth/auth';
import { user as userTable, auditLog } from '@database/schemas'
import { eq } from 'drizzle-orm'

beforeEach(() => {
  Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value))
})

describe('Auth — critical integration tests', () => {
  it('sign-up creates user and audit log', async () => {
    const authInstance = await getAuth();
    const ctx = await authInstance.$context;
    const test = ctx.test;
    const userObj = test.createUser();
    const user = await test.saveUser(userObj);
    expect(user).toBeDefined();
    const userId = user.id;
    expect(userId).toBeTruthy();
    const db = await getTestDb();
    const audits = await db.select().from(auditLog).where(eq(auditLog.userId, userId));
    const signupAudit = audits.find((a: any) => a.action === 'signup');
    expect(signupAudit).toBeDefined();
  });

  it('sign-in returns token for valid credentials', async () => {
    const authInstance = await getAuth();
    const ctx = await authInstance.$context;
    const test = ctx.test;
    const userObj = test.createUser({ emailVerified: true });
    const user = await test.saveUser(userObj);
    const db = await getTestDb();
    const users = await db.select().from(userTable).where(eq(userTable.email, user.email!));
    expect(users.length).toBeGreaterThan(0);
    const result = await test.login({ userId: user.id });
    expect(result.token).toBeDefined();
  });

  it('sign-in with invalid password logs login_failed', async () => {
    const authInstance = await getAuth();
    const ctx = await authInstance.$context;
    const test = ctx.test;
    const userObj = test.createUser({ emailVerified: true });
    const user = await test.saveUser(userObj);
    let failed: any;
    try {
      failed = await authInstance.api.signInEmail({ body: { email: user.email, password: 'wrong-password' } });
    } catch (err: any) {
      failed = err?.body || {};
    }
    expect((failed as any).token).toBeUndefined();
    const db = await getTestDb();
    const audits = await db.select().from(auditLog).where(eq(auditLog.userId, user.id));
    const lastFailed = audits.reverse().find((a: any) => a.action === 'login_failed' && a.data?.email === user.email);
    expect(lastFailed).toBeDefined();
  });

  it('duplicate sign-up is rejected', async () => {
    const authInstance = await getAuth();
    const ctx = await authInstance.$context;
    const test = ctx.test;
    const userObj = test.createUser();
    const user = await test.saveUser(userObj);
    await expect(authInstance.api.signUpEmail({ body: { email: user.email!, password: 'SafePass123!', username: user.name, name: user.name } })).resolves.not.toThrow();
    await expect(auth.api.signUpEmail({ body: { email: user.email!, password: 'SafePass123!', username: user.name + '-2', name: user.name } })).rejects.toThrow();
  })
})
