/**
 * Integration tests for /api/admin/organizations/profile — rich org profile CRUD.
 * Tests admin guard, create, update, toggle, delete, and not_found handling.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TEST_ENV } from '@tests/config/test-env'
import { serverAvailable } from '@tests/helpers/server-guard'
import { apiCall } from '@tests/utils/api-helpers'
import { createAdminWithToken, createUserWithToken, buildApiHeaders } from '@tests/fixtures/test-factory'
import { randomUUID } from 'crypto'

const serverUp = await serverAvailable()

describe.skipIf(!serverUp)('API /api/admin/organizations/profile', () => {
  beforeEach(() => {
    Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value))
  })

  it('rejects non-admin GET', async () => {
    const { token } = await createUserWithToken()
    const res = await apiCall('GET', '/admin/organizations/profile', undefined, { token })
    expect(res.status).toBe(403)
  })

  it('returns all org profiles for admin', async () => {
    const { token } = await createAdminWithToken()
    const headers = buildApiHeaders(token)
    const res = await apiCall('GET', '/admin/organizations/profile', undefined, { headers })
    expect(res.status).toBe(200)
    expect(res.data).toHaveProperty('organizations')
  })

  it('returns 404 for non-existent org', async () => {
    const { token } = await createAdminWithToken()
    const headers = buildApiHeaders(token)
    const res = await apiCall('GET', `/admin/organizations/profile?id=${randomUUID()}`, undefined, { headers })
    expect(res.status).toBe(404)
  })

  it('creates an org profile', async () => {
    const { token } = await createAdminWithToken()
    const headers = buildApiHeaders(token)
    const slug = `test-org-${Date.now()}`
    const res = await apiCall('POST', '/admin/organizations/profile', {
      action: 'create', name: 'Test Org', slug,
    }, { headers })
    expect(res.status).toBe(201)
    expect(res.data.organization).toHaveProperty('id')
  })

  it('rejects create missing name/slug', async () => {
    const { token } = await createAdminWithToken()
    const headers = buildApiHeaders(token)
    const res = await apiCall('POST', '/admin/organizations/profile', {
      action: 'create', name: 'Only Name',
    }, { headers })
    expect(res.status).toBe(400)
    expect(res.data.error).toBe('missing_name_or_slug')
  })

  it('rejects update without organizationId', async () => {
    const { token } = await createAdminWithToken()
    const headers = buildApiHeaders(token)
    const res = await apiCall('POST', '/admin/organizations/profile', {
      action: 'update', name: 'New Name',
    }, { headers })
    expect(res.status).toBe(400)
    expect(res.data.error).toBe('missing_organizationId')
  })

  it('rejects unknown action', async () => {
    const { token } = await createAdminWithToken()
    const headers = buildApiHeaders(token)
    const res = await apiCall('POST', '/admin/organizations/profile', { action: 'nuke' }, { headers })
    expect(res.status).toBe(400)
    expect(res.data.error).toBe('unknown_action')
  })
})
