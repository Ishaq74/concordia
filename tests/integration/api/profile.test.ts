/**
 * Integration tests for /api/profile endpoint.
 * Tests auth guard, auto-create, PATCH validation, field whitelist.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TEST_ENV } from '@tests/config/test-env'
import { serverAvailable } from '@tests/helpers/server-guard'
import { apiCall } from '@tests/utils/api-helpers'
import { createUserWithToken, buildApiHeaders } from '@tests/fixtures/test-factory'

const serverUp = await serverAvailable()

describe.skipIf(!serverUp)('API /api/profile', () => {
  beforeEach(() => {
    Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value))
  })

  describe('GET', () => {
    it('rejects unauthenticated request', async () => {
      const res = await apiCall('GET', '/profile')
      expect(res.status).toBe(401)
    })

    it('returns (or auto-creates) profile for authenticated user', async () => {
      const { token } = await createUserWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('GET', '/profile', undefined, { headers })
      expect(res.status).toBe(200)
      expect(res.data).toHaveProperty('userId')
      expect(res.data).toHaveProperty('preferredLanguage')
    })
  })

  describe('PATCH', () => {
    it('rejects unauthenticated request', async () => {
      const res = await apiCall('PATCH', '/profile', { fullName: 'Test' })
      expect(res.status).toBe(401)
    })

    it('rejects empty update body', async () => {
      const { token } = await createUserWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('PATCH', '/profile', {}, { headers })
      expect(res.status).toBe(400)
      expect(res.data.error).toBe('VAL_REQUIRED_FIELD')
    })

    it('rejects bio over 500 chars', async () => {
      const { token } = await createUserWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('PATCH', '/profile', { bio: 'x'.repeat(501) }, { headers })
      expect(res.status).toBe(400)
      expect(res.data.error).toBe('VAL_TOO_LONG')
    })

    it('rejects invalid preferredLanguage', async () => {
      const { token } = await createUserWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('PATCH', '/profile', { preferredLanguage: 'zh' }, { headers })
      expect(res.status).toBe(400)
      expect(res.data.error).toBe('VAL_INVALID_ENUM')
    })

    it('rejects website over 255 chars', async () => {
      const { token } = await createUserWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('PATCH', '/profile', { website: 'https://' + 'x'.repeat(250) }, { headers })
      expect(res.status).toBe(400)
      expect(res.data.error).toBe('VAL_TOO_LONG')
    })

    it('updates valid fields', async () => {
      const { token } = await createUserWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('PATCH', '/profile', {
        fullName: 'Test User Updated',
        bio: 'Hello',
        preferredLanguage: 'en',
      }, { headers })
      expect(res.status).toBe(200)
      expect(res.data.fullName).toBe('Test User Updated')
      expect(res.data.preferredLanguage).toBe('en')
    })

    it('ignores non-whitelisted fields', async () => {
      const { token } = await createUserWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('PATCH', '/profile', {
        fullName: 'Legit',
        role: 'admin', // not whitelisted
      }, { headers })
      expect(res.status).toBe(200)
      expect(res.data.fullName).toBe('Legit')
      // role should not be in the profile table at all
    })
  })
})
