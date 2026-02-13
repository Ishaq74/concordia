import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getAuth } from '@/lib/auth/auth'
import { TEST_ENV } from '@tests/config/test-env'

describe('BetterAuth Email Functions', () => {
  beforeEach(() => {
    Object.entries(TEST_ENV).forEach(([key, value]) => {
      vi.stubEnv(key, value)
    })
  })

  describe('Email Verification', () => {
    it('should have email verification config', async () => {
      const auth = await getAuth()
      const config = (auth as any).options.emailVerification

      expect(config).toBeDefined()
      expect(config.sendOnSignUp).toBe(true)
      expect(config.sendVerificationEmail).toBeDefined()
    })

    it('should call sendVerificationEmail without error', async () => {
      const auth = await getAuth()
      const config = (auth as any).options.emailVerification

      await expect(
        config.sendVerificationEmail({
          user: { email: 'test@example.com', id: 'user-123' },
          url: 'http://localhost:3000/verify?code=abc123',
          token: 'abc123',
        })
      ).resolves.not.toThrow()
    })

    it('should log mock SMTP when email verification is called', async () => {
      const auth = await getAuth()
      const config = (auth as any).options.emailVerification
      const consoleSpy = vi.spyOn(console, 'log')

      await config.sendVerificationEmail({
        user: { email: 'test@example.com', id: 'user-123' },
        url: 'http://localhost:3000/verify?code=abc123',
        token: 'abc123',
      })

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[MOCK SMTP]')
      )
      consoleSpy.mockRestore()
    })
  })

  describe('Password Reset', () => {
    it('should have sendResetPassword config', async () => {
      const auth = await getAuth()
      const config = (auth as any).options.emailAndPassword

      expect(config).toBeDefined()
      expect(config.sendResetPassword).toBeDefined()
    })

    it('should call sendResetPassword without error', async () => {
      const auth = await getAuth()
      const config = (auth as any).options.emailAndPassword

      await expect(
        config.sendResetPassword({
          user: { email: 'test@example.com', id: 'user-123' },
          url: 'http://localhost:3000/reset?token=xyz789',
          token: 'xyz789',
        })
      ).resolves.not.toThrow()
    })

    it('should log mock SMTP when password reset is called', async () => {
      const auth = await getAuth()
      const config = (auth as any).options.emailAndPassword
      const consoleSpy = vi.spyOn(console, 'log')

      await config.sendResetPassword({
        user: { email: 'test@example.com', id: 'user-123' },
        url: 'http://localhost:3000/reset?token=xyz789',
        token: 'xyz789',
      })

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[MOCK SMTP]')
      )
      consoleSpy.mockRestore()
    })
  })

  // ...remaining test cases as per the provided structure...
})
