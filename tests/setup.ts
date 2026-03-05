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

let serverProcess: any;

beforeAll(async () => {
  console.log('\n🧪 Starting test suite...\n');
  if (!serverProcess) {
    // spawn astro dev server on port 4321 for e2e/security/SSR tests. Vite will
    // automatically try subsequent ports if the requested one is taken. After
    // launch we probe a small range of ports to discover the actual listening
    // address, then update TEST_BASE_URL accordingly.
    const { spawn } = require('child_process');
    serverProcess = spawn('npx', ['astro', 'dev', '--port', '4321'], {
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'test' },
    });

    serverProcess.on('error', (err: any) => console.error('server spawn error', err));
    serverProcess.on('exit', (code: any, sig: any) => console.log('server process exited', code, sig));

    // also print stdout/stderr for debugging
    serverProcess.stdout.on('data', (c: Buffer) => process.stdout.write(c.toString()));
    serverProcess.stderr.on('data', (c: Buffer) => process.stderr.write(c.toString()));

    // give the server some time to start
    await new Promise((r) => setTimeout(r, 10000));

    // attempt to find a responsive port in the 4321..4340 range
    let foundPort: number | null = null;
    for (let p = 4321; p < 4350; p++) {
      try {
        const res = await fetch(`http://localhost:${p}/`);
        if (res.ok || res.status === 404) {
          foundPort = p;
          break;
        }
      } catch {
        // ignore connection failure
      }
    }
    if (foundPort === null) {
      console.warn('Unable to detect dev server port, falling back to 4321');
      foundPort = 4321;
    }
    const newBase = `http://localhost:${foundPort}/api/auth`;
    process.env.TEST_BASE_URL = newBase;
    TEST_ENV.TEST_BASE_URL = newBase;
    console.log('✅ test base URL set to', newBase);
  }
  await cleanupTestData();
})

// NOTE: we deliberately do NOT kill the server in afterAll so it persists
// across test files. Node process exit will clean it up automatically.

afterAll(async () => {
  console.log('\n✅ Test suite complete\n');
  await cleanupTestData();
})

beforeEach(async () => {
  // Ensure a clean DB state at the start of every test to avoid cross-test
  // interference when Vitest runs tests in parallel/forks.
  await cleanupTestData()
})

afterAll(async () => {
  console.log('\n✅ Test suite complete\n')
  await cleanupTestData()
})

afterEach(() => {
  vi.clearAllMocks()
})

// SMTP mock global for email tests

export const sendMailMock = {
  mock: {
    calls: [],
    clear() { this.calls = []; },
  },
  mockClear() { this.mock.clear(); },
};

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
