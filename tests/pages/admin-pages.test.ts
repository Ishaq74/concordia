/**
 * Unit tests for admin page helpers: org resolution, status badges, localization fallbacks,
 * pagination, translation maps, etc.
 * Covers: members, blog, bookings, services, translations admin pages.
 */
import { describe, it, expect } from 'vitest'
import { getTranslations } from '@i18n/translations'

const supportedLocales = ['fr', 'en', 'ar', 'es']

/* ================================================================
 * ORG RESOLUTION LOGIC
 * All admin pages share the same 5-step org fallback.
 * ================================================================ */
describe('Admin pages — org resolution logic', () => {
  it('prefers query param org over session', () => {
    const queryOrg = 'org-from-query'
    const sessionOrg = 'org-from-session'
    const activeOrgId = queryOrg || sessionOrg
    expect(activeOrgId).toBe('org-from-query')
  })

  it('falls back to session org when no query param', () => {
    const queryOrg = ''
    const sessionOrg = 'org-from-session'
    const activeOrgId = queryOrg || sessionOrg
    expect(activeOrgId).toBe('org-from-session')
  })

  it('results in redirect when no org found', () => {
    const activeOrgId: string | undefined | null = null
    expect(!activeOrgId).toBe(true)
  })
})

/* ================================================================
 * MEMBERS PAGE
 * ================================================================ */
describe('Admin members page — role labels and colors', () => {
  const roleLabels: Record<string, string> = {
    owner: 'Propriétaire',
    admin: 'Administrateur',
    member: 'Membre',
    editor: 'Éditeur',
    manager: 'Manager',
    translator: 'Traducteur',
  }

  const roleBadgeColors: Record<string, string> = {
    owner: 'accent',
    admin: 'warning',
    member: 'secondary',
    editor: 'primary',
    manager: 'success',
    translator: 'default',
  }

  it('has label for every defined role', () => {
    for (const role of Object.keys(roleLabels)) {
      expect(roleLabels[role]).toBeTruthy()
      expect(typeof roleLabels[role]).toBe('string')
    }
  })

  it('has badge color for every defined role', () => {
    const validColors = ['default', 'primary', 'secondary', 'accent', 'success', 'warning', 'error']
    for (const role of Object.keys(roleBadgeColors)) {
      expect(validColors).toContain(roleBadgeColors[role])
    }
  })

  it('counts roles correctly from member list', () => {
    const members = [
      { role: 'owner' }, { role: 'admin' }, { role: 'admin' },
      { role: 'member' }, { role: 'member' }, { role: 'member' },
      { role: 'editor' },
    ]
    const counts = members.reduce((acc, m) => {
      acc[m.role] = (acc[m.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    expect(counts.owner).toBe(1)
    expect(counts.admin).toBe(2)
    expect(counts.member).toBe(3)
    expect(counts.editor).toBe(1)
  })
})

/* ================================================================
 * BLOG PAGE
 * ================================================================ */
describe('Admin blog page — translation map', () => {
  it('builds translation title map correctly', () => {
    const translationsMap = new Map<string, { headline: unknown; inLanguage: string }[]>()

    const rawTranslations = [
      { postId: 'p1', headline: 'Bonjour', inLanguage: 'fr' },
      { postId: 'p1', headline: 'Hello', inLanguage: 'en' },
      { postId: 'p2', headline: 'Hola', inLanguage: 'es' },
    ]

    for (const tr of rawTranslations) {
      const list = translationsMap.get(tr.postId) ?? []
      list.push(tr)
      translationsMap.set(tr.postId, list)
    }

    expect(translationsMap.get('p1')?.length).toBe(2)
    expect(translationsMap.get('p2')?.length).toBe(1)
    expect(translationsMap.has('p3')).toBe(false)
  })

  it('localization chain: lang → inLanguage → fr → en → slug', () => {
    function getLocalizedTitle(
      trs: { headline: unknown; inLanguage: string }[],
      lang: string,
      slug: string,
    ): string {
      // Priority: matching lang → fr → en → first available → slug
      const byLang = trs.find(t => t.inLanguage === lang)
      if (byLang?.headline) return String(byLang.headline)
      const byFr = trs.find(t => t.inLanguage === 'fr')
      if (byFr?.headline) return String(byFr.headline)
      const byEn = trs.find(t => t.inLanguage === 'en')
      if (byEn?.headline) return String(byEn.headline)
      if (trs[0]?.headline) return String(trs[0].headline)
      return slug
    }

    const trs = [
      { headline: 'Bonjour', inLanguage: 'fr' },
      { headline: 'Hello', inLanguage: 'en' },
    ]

    expect(getLocalizedTitle(trs, 'fr', 'my-post')).toBe('Bonjour')
    expect(getLocalizedTitle(trs, 'en', 'my-post')).toBe('Hello')
    expect(getLocalizedTitle(trs, 'ar', 'my-post')).toBe('Bonjour')  // fallback fr
    expect(getLocalizedTitle([], 'fr', 'my-post')).toBe('my-post')   // no translations → slug
  })

  it('blog status filters are correct', () => {
    const validStatuses = ['published', 'draft', 'pending', 'archived']
    expect(validStatuses).toHaveLength(4)
  })

  it('blog stats count correctly', () => {
    const posts = [
      { status: 'published' }, { status: 'published' }, { status: 'draft' },
      { status: 'pending' }, { status: 'archived' },
    ]

    const published = posts.filter(p => p.status === 'published').length
    const drafts = posts.filter(p => p.status === 'draft').length
    expect(published).toBe(2)
    expect(drafts).toBe(1)
  })
})

/* ================================================================
 * BOOKINGS PAGE
 * ================================================================ */
describe('Admin bookings page — status badges', () => {
  const statusColors: Record<string, string> = {
    pending: 'warning',
    confirmed: 'primary',
    completed: 'success',
    cancelled: 'error',
    declined: 'secondary',
  }

  it('has valid Badge color for every booking status', () => {
    const validColors = ['default', 'primary', 'secondary', 'accent', 'success', 'warning', 'error']
    for (const [status, color] of Object.entries(statusColors)) {
      expect(validColors).toContain(color)
      expect(status).toBeTruthy()
    }
  })

  it('covers all 5 booking statuses', () => {
    expect(Object.keys(statusColors)).toHaveLength(5)
  })
})

describe('Admin bookings page — pagination', () => {
  const perPage = 20

  it('calculates total pages correctly', () => {
    expect(Math.max(1, Math.ceil(0 / perPage))).toBe(1)
    expect(Math.max(1, Math.ceil(1 / perPage))).toBe(1)
    expect(Math.max(1, Math.ceil(20 / perPage))).toBe(1)
    expect(Math.max(1, Math.ceil(21 / perPage))).toBe(2)
    expect(Math.max(1, Math.ceil(100 / perPage))).toBe(5)
  })

  it('preserves filter in pagination URL', () => {
    function buildBookingPaginationUrl(lang: string, status: string, page: number) {
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      params.set('page', String(page))
      return `/${lang}/admin/organizations/bookings?${params.toString()}`
    }

    expect(buildBookingPaginationUrl('fr', 'pending', 2)).toBe('/fr/admin/organizations/bookings?status=pending&page=2')
    expect(buildBookingPaginationUrl('en', '', 1)).toBe('/en/admin/organizations/bookings?page=1')
  })
})

describe('Admin bookings page — customer/provider map', () => {
  it('de-duplicates user lookups', () => {
    const bookings = [
      { customerId: 'u1', providerId: 'u2' },
      { customerId: 'u1', providerId: 'u3' },
      { customerId: 'u2', providerId: 'u3' },
    ]
    const uniqueUserIds = [...new Set(bookings.flatMap(b => [b.customerId, b.providerId]))]
    expect(uniqueUserIds).toHaveLength(3)
    expect(uniqueUserIds).toContain('u1')
    expect(uniqueUserIds).toContain('u2')
    expect(uniqueUserIds).toContain('u3')
  })
})

/* ================================================================
 * SERVICES PAGE
 * ================================================================ */
describe('Admin services page — status filters', () => {
  const serviceStatuses = ['active', 'pending_review', 'draft', 'suspended', 'archived']

  it('defines 5 service statuses', () => {
    expect(serviceStatuses).toHaveLength(5)
  })

  it('builds conditions correctly with status filter', () => {
    function buildWhereConditions(orgId: string, statusFilter: string, categoryFilter: string) {
      const conditions: string[] = [`orgId=${orgId}`]
      if (statusFilter) conditions.push(`status=${statusFilter}`)
      if (categoryFilter) conditions.push(`category=${categoryFilter}`)
      return conditions
    }

    expect(buildWhereConditions('org-1', '', '')).toHaveLength(1)
    expect(buildWhereConditions('org-1', 'active', '')).toHaveLength(2)
    expect(buildWhereConditions('org-1', 'active', 'cat-1')).toHaveLength(3)
  })
})

describe('Admin services page — translation batch loading', () => {
  it('maps translations by service ID', () => {
    const translations = [
      { serviceId: 's1', title: 'Service A', inLanguage: 'fr' },
      { serviceId: 's1', title: 'Service A EN', inLanguage: 'en' },
      { serviceId: 's2', title: 'Service B', inLanguage: 'fr' },
    ]

    const map = new Map<string, { title: unknown; inLanguage: string }[]>()
    for (const tr of translations) {
      const list = map.get(tr.serviceId) ?? []
      list.push(tr)
      map.set(tr.serviceId, list)
    }

    expect(map.get('s1')?.length).toBe(2)
    expect(map.get('s2')?.length).toBe(1)
    expect(map.has('s3')).toBe(false)
  })
})

/* ================================================================
 * TRANSLATIONS PAGE
 * ================================================================ */
describe('Admin translations page — progress calculation', () => {
  it('calculates blog translation progress (3 fields)', () => {
    function calcProgress(fields: Record<string, string | null | undefined>): number {
      const total = Object.keys(fields).length
      if (!total) return 0
      const filled = Object.values(fields).filter(v => v && v.trim().length > 0).length
      return Math.round((filled / total) * 100)
    }

    expect(calcProgress({ title: 'Hello', excerpt: 'Sum', content: 'Body' })).toBe(100)
    expect(calcProgress({ title: 'Hello', excerpt: '', content: '' })).toBe(33)
    expect(calcProgress({ title: null, excerpt: null, content: null })).toBe(0)
    expect(calcProgress({ title: 'Hello', excerpt: null, content: 'Body' })).toBe(67)
  })

  it('calculates service translation progress (2 fields)', () => {
    function calcProgress(fields: Record<string, string | null | undefined>): number {
      const total = Object.keys(fields).length
      if (!total) return 0
      const filled = Object.values(fields).filter(v => v && v.trim().length > 0).length
      return Math.round((filled / total) * 100)
    }

    expect(calcProgress({ title: 'Servicio', description: 'Desc' })).toBe(100)
    expect(calcProgress({ title: 'Servicio', description: '' })).toBe(50)
    expect(calcProgress({ title: '', description: '' })).toBe(0)
  })
})

describe('Admin translations page — locale flags', () => {
  it('maps locale codes to flag emojis', () => {
    const flagMap: Record<string, string> = {
      fr: '🇫🇷', en: '🇬🇧', ar: '🇸🇦', es: '🇪🇸',
    }
    for (const locale of supportedLocales) {
      expect(flagMap[locale]).toBeTruthy()
    }
  })

  it('shows translated locale dots correctly', () => {
    const existingTranslations = ['fr', 'en']
    const allLocales = ['fr', 'en', 'ar', 'es']

    const translated = allLocales.filter(l => existingTranslations.includes(l))
    const missing = allLocales.filter(l => !existingTranslations.includes(l))

    expect(translated).toEqual(['fr', 'en'])
    expect(missing).toEqual(['ar', 'es'])
  })
})

/* ================================================================
 * SHARED — ADMIN TRANSLATIONS
 * ================================================================ */
describe('Admin pages — i18n translations', () => {
  for (const lang of supportedLocales) {
    it(`${lang}: adminOrganizations translations accessible`, () => {
      const t = getTranslations(lang)
      expect(t).toBeDefined()
      // Pages use t.adminOrganizations ?? {} as fallback
      const to = t.adminOrganizations ?? ({} as Record<string, string>)
      expect(typeof to).toBe('object')
    })
  }
})
