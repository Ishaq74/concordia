import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TEST_ENV } from '@tests/config/test-env'

describe('BetterAuth Email Functions', () => {
  // using helpers from auth-test-utils makes setup/teardown deterministic and
  // eliminates hardcoded IDs.  stubbing env remains necessary for configs.
  beforeEach(() => {
    Object.entries(TEST_ENV).forEach(([key, value]) => {
      vi.stubEnv(key, value)
    })
  })

  describe('Email Verification', () => {
    it('should have email verification config', async () => {
      const { getAuth } = await import('@lib/auth/auth')
      const auth = await getAuth()
      const config = (auth as any).options.emailVerification

      expect(config).toBeDefined()
      expect(config.sendOnSignUp).toBe(true)
      expect(config.sendVerificationEmail).toBeDefined()
    })

    it('should send verification email when called through config function', async () => {
      const { getAuth } = await import('@lib/auth/auth')
      const auth = await getAuth()
      const config = (auth as any).options.emailVerification
      const { getCalls } = await import('@tests/setup').then(m => m.createSmtpMock())

      const dummy = `signup_${Math.random().toString(36).slice(2, 10)}@test.local`
      await config.sendVerificationEmail({
        user: { email: dummy, id: 'user-signup-test' },
        url: 'http://localhost:3000/verify?code=test123',
        token: 'test123',
      })

      const calls = getCalls()
      expect(calls.length).toBeGreaterThan(0)
      // auth.ts pushes flat objects to mock.calls (not array-wrapped)
      const payload = calls[calls.length - 1]
      expect(payload).toMatchObject({
        to: dummy,
        subject: expect.stringContaining('rifi'),
      })
    })

    it('should log mock SMTP when email verification is called directly', async () => {
      const { getAuth } = await import('@lib/auth/auth')
      const auth = await getAuth()
      const config = (auth as any).options.emailVerification
      const { getCalls } = await import('@tests/setup').then(m => m.createSmtpMock());
      const dummy = `verify_${Math.random().toString(36).slice(2, 10)}@test.local`
      await config.sendVerificationEmail({
        user: { email: dummy, id: 'user-123' },
        url: 'http://localhost:3000/verify?code=abc123',
        token: 'abc123',
      })
      const calls = getCalls();
      expect(calls.length).toBeGreaterThan(0);
      // auth.ts pushes flat objects to mock.calls
      const payload = calls[calls.length - 1];
      expect(payload).toMatchObject({
        to: dummy,
        subject: expect.stringContaining('rifi'),
      });
    })
  })

  describe('Password Reset', () => {
    it('should have sendResetPassword config', async () => {
      const { getAuth } = await import('@lib/auth/auth')
      const auth = await getAuth()
      const config = (auth as any).options.emailAndPassword

      expect(config).toBeDefined()
      expect(config.sendResetPassword).toBeDefined()
    })

    it('should call sendResetPassword without error', async () => {
      const { getAuth } = await import('@lib/auth/auth')
      const auth = await getAuth()
      const config = (auth as any).options.emailAndPassword
      const dummy = `reset_${Math.random().toString(36).slice(2, 10)}@test.local`

      await expect(
        config.sendResetPassword({
          user: { email: dummy, id: 'user-123' },
          url: 'http://localhost:3000/reset?token=xyz789',
          token: 'xyz789',
        })
      ).resolves.not.toThrow()
    })

    it('should log mock SMTP when password reset is called', async () => {
      const { getAuth } = await import('@lib/auth/auth')
      const auth = await getAuth()
      const config = (auth as any).options.emailAndPassword
      const { getCalls } = await import('@tests/setup').then(m => m.createSmtpMock());
      const dummy = `reset_${Math.random().toString(36).slice(2, 10)}@test.local`
      await config.sendResetPassword({
        user: { email: dummy, id: 'user-123' },
        url: 'http://localhost:3000/reset?token=xyz789',
        token: 'xyz789',
      })
      const calls = getCalls();
      expect(calls.length).toBeGreaterThan(0);
      // auth.ts pushes flat objects to mock.calls
      const payload = calls[calls.length - 1];
      expect(payload).toMatchObject({
        to: dummy,
        subject: expect.stringContaining('reset'),
      });
    })
  })

  // ...remaining test cases as per the provided structure...
})
