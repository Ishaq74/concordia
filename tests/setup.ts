import 'dotenv/config'
import { afterAll, afterEach, beforeEach, vi, expect } from 'vitest'
import * as axeMatchers from 'vitest-axe/matchers';
import { cleanupTestData } from './utils/cleanup'
import { httpCleanupTestUsers, closeDevDb } from './helpers/http-auth'
export { cleanupTestData };

// add axe matchers globally
expect.extend(axeMatchers);


// Only essential test environment setup remains

// Stub the better-auth admin plugin during tests to avoid admin plugin runtime
// behaviour that depends on optional DB tables not present in minimal test env.
// Provide hook objects in the shape expected by Better‑Auth (matcher + handler).
vi.mock('better-auth/plugins', async () => {
  const actual = await vi.importActual<any>('better-auth/plugins')
  return {
    ...actual,
    admin: () => ({
      name: 'admin-mock',
      hooks: {
        before: [
          {
            matcher: () => true,
            handler: async () => {
              /* no-op in tests */
            },
          },
        ],
      },
    }),
  }
})

// Ensure all imports of getDrizzle() inside app code used during tests
// resolve to the same test DB instance created by getTestDb().
vi.mock('@database/drizzle', async () => {
  const actual = await vi.importActual<any>('@database/drizzle')
  const testDb = await import('./config/test-db')
  return {
    ...actual,
    getDrizzle: async () => testDb.getTestDb(),
  }
})

// Replace the sync CLI `auth` export (which uses an unconnected pg.Client on
// the dev DB) with a properly initialised instance backed by the test DB.
// getAuth() internally calls getDrizzle() — already mocked above — so the
// returned instance connects to DATABASE_URL_TEST.
// The email functions in auth.ts push directly to sendMailMock.mock.calls
// when NODE_ENV=test, so no wrapper is needed here.
vi.mock('@lib/auth/auth', async () => {
  const actualModule = await vi.importActual<any>('@lib/auth/auth')
  const authInstance = await actualModule.getAuth()

  return {
    ...actualModule,
    auth: authInstance,
    default: authInstance,
    getAuth: async () => authInstance,
  }
})

// Server-dependent tests (page-render, security, etc.) use the
// serverAvailable() guard and skip automatically when no dev server is running.
// To run those tests, start the server with:  pnpm dev:test
// (this sets SMTP_MOCK=1 so integration tests never send real emails)
// The guard in tests/helpers/server-guard.ts handles detection.

beforeEach(async () => {
  await cleanupTestData()
})

afterEach(() => {
  vi.clearAllMocks()
})

// Clean up HTTP-created test users from the dev DB after each test file completes.
afterAll(async () => {
  await httpCleanupTestUsers();
  await closeDevDb();
})

// SMTP mock global for email tests

export const sendMailMock = {
  mock: {
    calls: [] as any[],
    clear() { this.calls = []; },
  },
  mockClear() { this.mock.clear(); },
};

// Expose on globalThis so the auth mock factory can push calls
;(globalThis as any).__sendMailMock = sendMailMock;

/** Creates a resettable SMTP mock that tracks sendMail calls. */
export type SmtpMockPayload = {
  to?: string;
  subject?: string;
  html?: string;
  [key: string]: any;
};

export async function createSmtpMock() {
  sendMailMock.mockClear();
  return {
    getCalls: (): SmtpMockPayload[][] => sendMailMock.mock.calls as SmtpMockPayload[][],
  };
}
