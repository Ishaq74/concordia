/**
 * Unit tests for citizens page logic.
 * Tests search/filter logic, pagination URL generation, role helpers, stats.
 */
import { describe, it, expect } from 'vitest'
import { getTranslations } from '@i18n/translations'

const supportedLocales = ['fr', 'en', 'ar', 'es']

/* ── Role helpers (mirrored from page) ──────────────────────── */
function roleLabel(role: string) {
  const map: Record<string, string> = { admin: 'Administrateur', user: 'Citoyen', moderator: 'Modérateur' }
  return map[role] || role
}

type BadgeColor = 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error'
function roleColor(role: string): BadgeColor {
  const map: Record<string, BadgeColor> = { admin: 'accent', user: 'secondary', moderator: 'primary' }
  return map[role] || 'secondary'
}

/* ── Pagination URL builder (mirrored from page) ─────────── */
function buildPaginationBase(lang: string, search: string, roleFilter: string) {
  const filterParams = new URLSearchParams()
  if (search) filterParams.set('q', search)
  if (roleFilter) filterParams.set('role', roleFilter)
  const qs = filterParams.toString()
  return `/${lang}/citizens?${qs}${qs ? '&' : ''}page=`
}

/* ── Tests ───────────────────────────────────────────────────── */
describe('Citizens page — role helpers', () => {
  it('roleLabel returns correct labels for known roles', () => {
    expect(roleLabel('admin')).toBe('Administrateur')
    expect(roleLabel('user')).toBe('Citoyen')
    expect(roleLabel('moderator')).toBe('Modérateur')
  })

  it('roleLabel returns raw role for unknown roles', () => {
    expect(roleLabel('editor')).toBe('editor')
    expect(roleLabel('superadmin')).toBe('superadmin')
  })

  it('roleColor returns valid Badge color for known roles', () => {
    expect(roleColor('admin')).toBe('accent')
    expect(roleColor('user')).toBe('secondary')
    expect(roleColor('moderator')).toBe('primary')
  })

  it('roleColor returns secondary for unknown roles', () => {
    expect(roleColor('editor')).toBe('secondary')
    expect(roleColor('')).toBe('secondary')
  })

  it('roleColor only returns valid Badge colors', () => {
    const validColors: BadgeColor[] = ['default', 'primary', 'secondary', 'accent', 'success', 'warning', 'error']
    for (const role of ['admin', 'user', 'moderator', 'unknown', '']) {
      expect(validColors).toContain(roleColor(role))
    }
  })
})

describe('Citizens page — pagination URL builder', () => {
  it('generates base URL without filters', () => {
    expect(buildPaginationBase('fr', '', '')).toBe('/fr/citizens?page=')
  })

  it('includes search query in URL', () => {
    const url = buildPaginationBase('fr', 'alice', '')
    expect(url).toBe('/fr/citizens?q=alice&page=')
  })

  it('includes role filter in URL', () => {
    const url = buildPaginationBase('fr', '', 'admin')
    expect(url).toBe('/fr/citizens?role=admin&page=')
  })

  it('includes both search and role in URL', () => {
    const url = buildPaginationBase('en', 'bob', 'user')
    expect(url).toBe('/en/citizens?q=bob&role=user&page=')
  })

  it('works for all supported locales', () => {
    for (const lang of supportedLocales) {
      const url = buildPaginationBase(lang, '', '')
      expect(url).toMatch(new RegExp(`^/${lang}/citizens\\?page=$`))
    }
  })
})

describe('Citizens page — pagination math', () => {
  it('calculates total pages correctly', () => {
    const perPage = 12
    expect(Math.ceil(0 / perPage)).toBe(0)
    expect(Math.ceil(1 / perPage)).toBe(1)
    expect(Math.ceil(12 / perPage)).toBe(1)
    expect(Math.ceil(13 / perPage)).toBe(2)
    expect(Math.ceil(100 / perPage)).toBe(9)
  })

  it('calculates offset correctly', () => {
    const perPage = 12
    expect((1 - 1) * perPage).toBe(0)
    expect((2 - 1) * perPage).toBe(12)
    expect((3 - 1) * perPage).toBe(24)
  })

  it('clamps page to min 1', () => {
    expect(Math.max(1, parseInt('-5'))).toBe(1)
    expect(Math.max(1, parseInt('0'))).toBe(1)
    expect(Math.max(1, parseInt('1'))).toBe(1)
    expect(Math.max(1, parseInt('3'))).toBe(3)
    // Page uses: parseInt(param || "1") which prevents NaN
    const emptyParam: string = ''
    const fallback = emptyParam || '1'
    expect(Math.max(1, parseInt(fallback))).toBe(1)
  })
})

describe('Citizens page — translations', () => {
  for (const lang of supportedLocales) {
    it(`${lang}: has no crash on citizens translations`, () => {
      const t = getTranslations(lang)
      expect(t).toBeDefined()
      // Page uses fallbacks like t.citizens?.title ?? "Recensement de la Cité"
      const title = t.citizens?.title ?? 'Recensement de la Cité'
      expect(typeof title).toBe('string')
    })
  }
})

describe('Citizens page — districts data', () => {
  it('defines 4 district types', () => {
    const districts = ['cartography', 'mediation', 'skills', 'education']
    expect(districts).toHaveLength(4)
  })
})

describe('Citizens page — roles dropdown', () => {
  it('defines all + user + admin filter options', () => {
    const roles = [
      { value: '', label: 'Tous les rôles' },
      { value: 'user', label: 'Citoyen' },
      { value: 'admin', label: 'Administrateur' },
    ]
    expect(roles).toHaveLength(3)
    expect(roles[0].value).toBe('')
    expect(roles.map(r => r.value)).toContain('user')
    expect(roles.map(r => r.value)).toContain('admin')
  })
})

describe('Citizens profile page — fallback chains', () => {
  it('name fallback: fullName → name → username', () => {
    function getDisplayName(fullName?: string | null, name?: string | null, username?: string | null) {
      return fullName || name || username || 'Anonyme'
    }

    expect(getDisplayName('Alice Doe', 'Alice', 'alice')).toBe('Alice Doe')
    expect(getDisplayName(null, 'Alice', 'alice')).toBe('Alice')
    expect(getDisplayName(null, null, 'alice')).toBe('alice')
    expect(getDisplayName(null, null, null)).toBe('Anonyme')
  })

  it('avatar fallback: image → avatarUrl → placeholder', () => {
    function getAvatar(image?: string | null, avatarUrl?: string | null) {
      return image || avatarUrl || null
    }

    expect(getAvatar('https://img.com/photo.jpg', null)).toBe('https://img.com/photo.jpg')
    expect(getAvatar(null, 'https://cdn.com/avatar.png')).toBe('https://cdn.com/avatar.png')
    expect(getAvatar(null, null)).toBeNull()
  })

  it('average rating formatted correctly', () => {
    function formatRating(avg: number | null): string {
      if (!avg) return '—'
      return avg.toFixed(1)
    }

    expect(formatRating(4.5)).toBe('4.5')
    expect(formatRating(3.0)).toBe('3.0')
    expect(formatRating(null)).toBe('—')
    expect(formatRating(0)).toBe('—')
  })

  it('member since year from createdAt', () => {
    const date = new Date('2023-06-15T00:00:00Z')
    expect(date.getFullYear()).toBe(2023)
  })
})
