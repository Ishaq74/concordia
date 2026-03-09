/**
 * Unit tests for src/lib/auth/auth-client.ts
 * Tests sendVerificationEmail and sendForgotPasswordEmail helpers.
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock better-auth client
vi.mock('better-auth/client', () => ({
  createAuthClient: vi.fn().mockReturnValue({
    signIn: vi.fn(),
    signUp: vi.fn(),
  }),
}))

vi.mock('better-auth/client/plugins', () => ({
  organizationClient: vi.fn().mockReturnValue({}),
}))

vi.mock('@lib/auth/permissions', () => ({
  ac: {},
  roles: {},
}))

describe('auth/auth-client', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('sendVerificationEmail', () => {
    it('sends POST to /api/auth-client/verification', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )

      const { sendVerificationEmail } = await import('@lib/auth/auth-client')
      await sendVerificationEmail({ email: 'test@example.com' })

      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/auth-client/verification',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' }),
        })
      )
    })

    it('includes callbackURL when provided', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )

      const { sendVerificationEmail } = await import('@lib/auth/auth-client')
      await sendVerificationEmail({ email: 'test@example.com', callbackURL: '/verify' })

      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/auth-client/verification',
        expect.objectContaining({
          body: JSON.stringify({ email: 'test@example.com', callbackURL: '/verify' }),
        })
      )
    })

    it('throws on non-ok response', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response('Bad Request', { status: 400 })
      )

      const { sendVerificationEmail } = await import('@lib/auth/auth-client')
      await expect(sendVerificationEmail({ email: 'bad@test.com' }))
        .rejects.toThrow('Bad Request')
    })

    it('throws with statusText when body is empty', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response('', { status: 500, statusText: 'Internal Server Error' })
      )

      const { sendVerificationEmail } = await import('@lib/auth/auth-client')
      await expect(sendVerificationEmail({ email: 'x@test.com' }))
        .rejects.toThrow()
    })
  })

  describe('sendForgotPasswordEmail', () => {
    it('sends POST to /api/auth-client/forgot-password', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )

      const { sendForgotPasswordEmail } = await import('@lib/auth/auth-client')
      await sendForgotPasswordEmail({ email: 'user@example.com' })

      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/auth-client/forgot-password',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'user@example.com' }),
        })
      )
    })

    it('includes callbackURL when provided', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )

      const { sendForgotPasswordEmail } = await import('@lib/auth/auth-client')
      await sendForgotPasswordEmail({ email: 'user@example.com', callbackURL: '/reset' })

      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/auth-client/forgot-password',
        expect.objectContaining({
          body: JSON.stringify({ email: 'user@example.com', callbackURL: '/reset' }),
        })
      )
    })

    it('throws on non-ok response', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response('Not Found', { status: 404 })
      )

      const { sendForgotPasswordEmail } = await import('@lib/auth/auth-client')
      await expect(sendForgotPasswordEmail({ email: 'x@test.com' }))
        .rejects.toThrow()
    })
  })

  describe('authClient export', () => {
    it('exports a default auth client', async () => {
      const module = await import('@lib/auth/auth-client')
      expect(module.default).toBeDefined()
      expect(module.authClient).toBeDefined()
    })
  })
})
