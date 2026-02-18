import { afterEach, beforeAll, afterAll, vi } from 'vitest'
import { cleanupTestData } from './utils/cleanup'


// Shared sendMail mock so createSmtpMock can track calls
const sendMailMock = vi.fn(async (options: any) => {
  const mockId = `mock-${Date.now()}-${Math.random()}`
  console.log('[MOCK SMTP]', {
    messageId: mockId,
    to: options.to,
    subject: options.subject,
    from: options.from,
  })
  return { messageId: mockId, response: 'Mock sent' }
})

// Mock nodemailer AVANT tout
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: sendMailMock,
      verify: vi.fn(async () => true),
      close: vi.fn(async () => undefined),
    })),
  },
}))

// Mock rate limiter
vi.mock('@lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 100 }),
  incrementAttempts: vi.fn(),
  resetAttempts: vi.fn(),
}))

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

beforeAll(async () => {
  console.log('\n🧪 Starting test suite...\n')
  await cleanupTestData()
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

/** Creates a resettable SMTP mock that tracks sendMail calls. */
export async function createSmtpMock() {
  sendMailMock.mockClear()
  return {
    getCalls: () => sendMailMock.mock.calls,
  }
}
