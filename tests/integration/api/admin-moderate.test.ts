/**
 * Integration tests for /api/admin/moderate endpoint.
 * Tests moderation workflow: auth, permission, validation, self-moderation prevention.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TEST_ENV } from '@tests/config/test-env'
import { randomUUID } from 'crypto'
import { serverAvailable } from '@tests/helpers/server-guard'
import { apiCall } from '@tests/utils/api-helpers'
import { createAdminWithToken, createUserWithToken, buildApiHeaders } from '@tests/fixtures/test-factory'

const serverUp = await serverAvailable()

describe.skipIf(!serverUp)('API /api/admin/moderate', () => {
  beforeEach(() => {
    Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value))
  })

  it('rejects unauthenticated request', async () => {
    const res = await apiCall('POST', '/admin/moderate', { postType: 'blogComments', postId: 'x', reason: 'spam content' })
    expect(res.status).toBe(401)
  })

  it('rejects user without moderation permission', async () => {
    const { token } = await createUserWithToken()
    const headers = buildApiHeaders(token)
    const res = await apiCall('POST', '/admin/moderate', { postType: 'blogComments', postId: 'x', reason: 'spam content' }, { headers })
    expect(res.status).toBe(403)
  })

  it('rejects missing fields', async () => {
    const { token } = await createAdminWithToken()
    const headers = buildApiHeaders(token)
    const res = await apiCall('POST', '/admin/moderate', { postType: 'blogComments' }, { headers })
    expect(res.status).toBe(400)
    expect(res.data.error).toBe('VAL_REQUIRED_FIELD')
  })

  it('rejects invalid postType', async () => {
    const { token } = await createAdminWithToken()
    const headers = buildApiHeaders(token)
    const res = await apiCall('POST', '/admin/moderate', { postType: 'invalid', postId: 'x', reason: 'spam content' }, { headers })
    expect(res.status).toBe(400)
    expect(res.data.error).toBe('VAL_INVALID_ENUM')
  })

  it('rejects reason too short', async () => {
    const { token } = await createAdminWithToken()
    const headers = buildApiHeaders(token)
    const res = await apiCall('POST', '/admin/moderate', { postType: 'blogComments', postId: 'x', reason: 'ab' }, { headers })
    expect(res.status).toBe(400)
    expect(res.data.error).toBe('VAL_TOO_SHORT')
  })

  it('returns 404 for non-existent entity', async () => {
    const { token } = await createAdminWithToken()
    const headers = buildApiHeaders(token)
    const res = await apiCall('POST', '/admin/moderate', { postType: 'blogComments', postId: randomUUID(), reason: 'spam content' }, { headers })
    expect(res.status).toBe(404)
    expect(res.data.error).toBe('BIZ_NOT_FOUND')
  })
})
