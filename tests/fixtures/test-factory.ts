/**
 * Shared test factory — centralizes duplicated auth/org setup patterns
 * used across integration, security, and e2e test files.
 */

import { auth } from '@lib/auth/auth';
import { getApiBase } from '@tests/utils/api-helpers';

type TestContext = Awaited<typeof auth.$context>['test'];

let _testContext: TestContext | null = null;

/**
 * Get or initialize the Better Auth test context.
 * Caches the result for the lifetime of the test process.
 */
export async function getTestContext(): Promise<TestContext> {
  if (!_testContext) {
    const ctx = await auth.$context;
    _testContext = ctx.test;
  }
  return _testContext;
}

/**
 * Create and save an admin user, returning their auth token.
 */
export async function createAdminWithToken(): Promise<{ userId: string; token: string }> {
  const test = await getTestContext();
  const adminUser = test.createUser({ role: 'admin', emailVerified: true });
  const user = await test.saveUser(adminUser);
  const login = await test.login({ userId: user.id });
  return { userId: user.id, token: login.token };
}

/**
 * Create and save a regular user, returning their auth token.
 */
export async function createUserWithToken(overrides: Record<string, unknown> = {}): Promise<{ userId: string; token: string }> {
  const test = await getTestContext();
  const newUser = test.createUser({ role: 'member', emailVerified: true, ...overrides });
  const user = await test.saveUser(newUser);
  const login = await test.login({ userId: user.id });
  return { userId: user.id, token: login.token };
}

/**
 * Create and save an organization.
 */
export async function createOrg(data: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
  const test = await getTestContext();
  return await test.saveOrganization(test.createOrganization(data)) as Record<string, unknown>;
}

/**
 * Create and save a user (without login).
 */
export async function createSavedUser(overrides: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
  const test = await getTestContext();
  return await test.saveUser(test.createUser({ emailVerified: true, ...overrides }));
}

/**
 * Build standard API headers with auth token and CSRF origin.
 */
export function buildApiHeaders(token: string): Record<string, string> {
  const base = getApiBase();
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Origin: new URL(base).origin,
    Host: new URL(base).host,
  };
}

/**
 * Measure response time for a fetch call.
 */
export async function measureResponseTime(url: string, options?: RequestInit): Promise<{ status: number; ms: number }> {
  const start = performance.now();
  const res = await fetch(url, options);
  const ms = performance.now() - start;
  return { status: res.status, ms };
}

/**
 * TEST_ENV stub values — used by integration tests that need env vars.
 */
export const TEST_ENV: Record<string, string> = {
  BETTER_AUTH_SECRET: 'test-secret-concordia',
  BETTER_AUTH_URL: getApiBase(),
  PUBLIC_APP_URL: getApiBase(),
};
