/**
 * Integration tests for /api/admin/roles endpoint.
 * Tests permission check, role assign/revoke, self-assignment prevention, enum validation.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TEST_ENV } from '@tests/config/test-env'
import { serverAvailable } from '@tests/helpers/server-guard'
import { apiCall } from '@tests/utils/api-helpers'
import { createAdminWithToken, createUserWithToken, createSavedUser, buildApiHeaders } from '@tests/fixtures/test-factory'

const serverUp = await serverAvailable()

describe.skipIf(!serverUp)('API /api/admin/roles', () => {
  beforeEach(() => {
    Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value))
  })

  it('rejects unauthenticated request', async () => {
    const res = await apiCall('POST', '/admin/roles', { action: 'assign', userId: 'x', role: 'admin' })
    expect(res.status).toBe(401)
  })

  it('rejects user without change_role permission', async () => {
    const { token } = await createUserWithToken()
    const headers = buildApiHeaders(token)
    const res = await apiCall('POST', '/admin/roles', { action: 'assign', userId: 'x', role: 'admin' }, { headers })
    expect(res.status).toBe(403)
  })

  it('rejects missing fields', async () => {
    const { token } = await createAdminWithToken()
    const headers = buildApiHeaders(token)
    const res = await apiCall('POST', '/admin/roles', { action: 'assign' }, { headers })
    expect(res.status).toBe(400)
    expect(res.data.error).toBe('VAL_REQUIRED_FIELD')
  })

  it('rejects invalid action enum', async () => {
    const { token } = await createAdminWithToken()
    const headers = buildApiHeaders(token)
    const res = await apiCall('POST', '/admin/roles', { action: 'delete', userId: 'x', role: 'admin' }, { headers })
    expect(res.status).toBe(400)
    expect(res.data.error).toBe('VAL_INVALID_ENUM')
  })

  it('rejects invalid role enum', async () => {
    const { token } = await createAdminWithToken()
    const headers = buildApiHeaders(token)
    const res = await apiCall('POST', '/admin/roles', { action: 'assign', userId: 'x', role: 'superuser' }, { headers })
    expect(res.status).toBe(400)
    expect(res.data.error).toBe('VAL_INVALID_ENUM')
  })

  it('prevents self-assignment', async () => {
    const { userId, token } = await createAdminWithToken()
    const headers = buildApiHeaders(token)
    const res = await apiCall('POST', '/admin/roles', { action: 'assign', userId, role: 'moderator' }, { headers })
    expect(res.status).toBe(400)
    expect(res.data.error).toBe('BIZ_SELF_ROLE_CHANGE')
  })

  it('prevents revoking citizen role', async () => {
    const { token } = await createAdminWithToken()
    const target = await createSavedUser()
    const headers = buildApiHeaders(token)
    const res = await apiCall('POST', '/admin/roles', {
      action: 'revoke',
      userId: (target as { id: string }).id,
      role: 'citizen',
    }, { headers })
    expect(res.status).toBe(400)
    expect(res.data.error).toBe('BIZ_CANNOT_REVOKE_CITIZEN')
  })

  it('assigns a valid role', async () => {
    const { token } = await createAdminWithToken()
    const target = await createSavedUser()
    const headers = buildApiHeaders(token)
    const res = await apiCall('POST', '/admin/roles', {
      action: 'assign',
      userId: (target as { id: string }).id,
      role: 'moderator',
    }, { headers })
    expect(res.status).toBe(200)
    expect(res.data.success).toBe(true)
    expect(res.data.action).toBe('assigned')
  })

  it('detects already-assigned role', async () => {
    const { token } = await createAdminWithToken()
    const target = await createSavedUser()
    const headers = buildApiHeaders(token)
    const targetId = (target as { id: string }).id

    // Assign first
    await apiCall('POST', '/admin/roles', { action: 'assign', userId: targetId, role: 'author' }, { headers })
    // Try again
    const res = await apiCall('POST', '/admin/roles', { action: 'assign', userId: targetId, role: 'author' }, { headers })
    expect(res.status).toBe(409)
    expect(res.data.error).toBe('BIZ_ROLE_ALREADY_ASSIGNED')
  })

  it('revokes a role', async () => {
    const { token } = await createAdminWithToken()
    const target = await createSavedUser()
    const headers = buildApiHeaders(token)
    const targetId = (target as { id: string }).id

    await apiCall('POST', '/admin/roles', { action: 'assign', userId: targetId, role: 'author' }, { headers })
    const res = await apiCall('POST', '/admin/roles', { action: 'revoke', userId: targetId, role: 'author' }, { headers })
    expect(res.status).toBe(200)
    expect(res.data.success).toBe(true)
    expect(res.data.action).toBe('revoked')
  })
})
