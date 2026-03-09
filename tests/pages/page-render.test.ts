/**
 * Page render tests — verify that all public/auth/admin pages return valid HTTP responses.
 * Tests that pages render without 500 errors and return expected content types.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TEST_ENV } from '@tests/config/test-env'
import { serverAvailable } from '@tests/helpers/server-guard'
import { getApiBase } from '@tests/utils/api-helpers'

const serverUp = await serverAvailable()

async function fetchPage(path: string): Promise<{ status: number; contentType: string | null }> {
  const base = getApiBase().replace(/\/api$/, '')
  const res = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(10000) })
  return { status: res.status, contentType: res.headers.get('content-type') }
}

describe.skipIf(!serverUp)('Page render — public pages', () => {
  beforeEach(() => {
    Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value))
  })

  const publicPages = [
    '/fr/',
    '/en/',
    '/ar/',
    '/es/',
    '/fr/a-propos/',
    '/en/about/',
    '/fr/contact/',
    '/en/contact/',
    '/fr/blog/',
    '/en/blog/',
    '/fr/services/',
    '/en/services/',
    '/fr/organisations/',
    '/en/organizations/',
    '/fr/charter/',
    '/en/charter/',
    '/fr/citizens/',
    '/en/citizens/',
    '/fr/search/',
    '/en/search/',
    '/fr/notifications/',
    '/en/notifications/',
  ]

  for (const path of publicPages) {
    it(`GET ${path} renders without error`, async () => {
      const { status, contentType } = await fetchPage(path)
      expect(status, `${path} should not return 500`).not.toBe(500)
      expect(contentType).toContain('text/html')
    })
  }
})

describe.skipIf(!serverUp)('Page render — auth pages', () => {
  beforeEach(() => {
    Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value))
  })

  const authPages = [
    '/fr/auth/connexion/',
    '/en/auth/sign-in/',
    '/fr/auth/inscription/',
    '/en/auth/sign-up/',
    '/fr/auth/mot-de-passe-oublie/',
    '/en/auth/forgot-password/',
    '/fr/auth/verifier-email/',
    '/en/auth/verify-email/',
  ]

  for (const path of authPages) {
    it(`GET ${path} renders without error`, async () => {
      const { status, contentType } = await fetchPage(path)
      expect(status, `${path} should not return 500`).not.toBe(500)
      expect(contentType).toContain('text/html')
    })
  }
})

describe.skipIf(!serverUp)('Page render — error pages', () => {
  it('404 page returns 404 status', async () => {
    const { status, contentType } = await fetchPage('/this-page-does-not-exist-at-all')
    expect(status).toBe(404)
    expect(contentType).toContain('text/html')
  })
})

describe.skipIf(!serverUp)('Page render — admin pages redirect unauthenticated', () => {
  beforeEach(() => {
    Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value))
  })

  const adminPages = [
    '/fr/admin/',
    '/en/admin/',
    '/fr/admin/organizations/members/',
    '/en/admin/organizations/members/',
    '/fr/admin/organizations/blog/',
    '/en/admin/organizations/blog/',
    '/fr/admin/organizations/bookings/',
    '/en/admin/organizations/bookings/',
    '/fr/admin/organizations/services/',
    '/en/admin/organizations/services/',
    '/fr/admin/organizations/translations/',
    '/en/admin/organizations/translations/',
  ]

  for (const path of adminPages) {
    it(`GET ${path} should not return 500 for unauthenticated user`, async () => {
      const base = getApiBase().replace(/\/api$/, '')
      const res = await fetch(`${base}${path}`, {
        redirect: 'manual',
        signal: AbortSignal.timeout(10000),
      })
      // Should either redirect to login or show the page — never 500
      expect(res.status, `${path} should not crash`).not.toBe(500)
    })
  }
})
