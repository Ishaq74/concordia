import 'dotenv/config'
import { afterEach, beforeAll, beforeEach, afterAll, vi, expect } from 'vitest'
import * as axeMatchers from 'vitest-axe/matchers';
import { cleanupTestData } from './utils/cleanup'
export { cleanupTestData };
import { TEST_ENV } from './config/test-env'

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
// resolve to the same in-memory DB instance created by getTestDb().
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

let serverProcess: any;

beforeAll(async () => {
  if (!serverProcess) {
    const { spawn } = require('child_process');
    serverProcess = spawn('npx', ['astro', 'dev', '--port', '4321'], {
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'test' },
    });

    serverProcess.on('error', (err: any) => console.error('server spawn error', err));

    // Poll until a port responds instead of a blind setTimeout
    let foundPort: number | null = null;
    const maxWait = 30_000; // 30 s ceiling
    const start = Date.now();
    while (Date.now() - start < maxWait) {
      for (let p = 4321; p < 4350; p++) {
        try {
          const res = await fetch(`http://localhost:${p}/`, {
            signal: AbortSignal.timeout(1000),
          });
          if (res.ok || res.status === 404) {
            foundPort = p;
            break;
          }
        } catch { /* not ready yet */ }
      }
      if (foundPort !== null) break;
      await new Promise((r) => setTimeout(r, 500));
    }
    if (foundPort === null) foundPort = 4321;
    const newBase = `http://localhost:${foundPort}/api/auth`;
    process.env.TEST_BASE_URL = newBase;
    TEST_ENV.TEST_BASE_URL = newBase;
  }
});

afterAll(async () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
})

beforeEach(async () => {
  await cleanupTestData()
})

afterEach(() => {
  vi.clearAllMocks()
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
