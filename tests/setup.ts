import { afterEach, beforeAll, afterAll, vi } from 'vitest'
import { cleanupTestData } from './utils/cleanup'

// Mock nodemailer AVANT tout
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn(async (options: any) => {
        const mockId = `mock-${Date.now()}-${Math.random()}`
        console.log('[MOCK SMTP]', {
          messageId: mockId,
          to: options.to,
          subject: options.subject,
          from: options.from,
        })
        return { messageId: mockId, response: 'Mock sent' }
      }),
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

beforeAll(async () => {
  console.log('\n🧪 Starting test suite...\n')
  await cleanupTestData()
})

afterAll(async () => {
  console.log('\n✅ Test suite complete\n')
  await cleanupTestData()
})

afterEach(() => {
  vi.clearAllMocks()
})
