/**
 * Dedicated unit tests for src/lib/auth/profile/utils.ts
 *
 * Covers: slugify(), resolveErrorMessage(), forwardSetCookies()
 */
import { describe, it, expect } from 'vitest'
import { slugify, resolveErrorMessage, forwardSetCookies } from '@lib/auth/profile/utils'

// ── slugify ───────────────────────────────────────────────────────────

describe('slugify', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('strips diacritics (NFD decomposition)', () => {
    expect(slugify('Café résumé')).toBe('cafe-resume')
  })

  it('removes non-alphanumeric characters', () => {
    expect(slugify('foo@bar!baz#qux')).toBe('foo-bar-baz-qux')
  })

  it('trims leading/trailing hyphens', () => {
    expect(slugify('--hello--')).toBe('hello')
  })

  it('collapses consecutive hyphens', () => {
    expect(slugify('a   b   c')).toBe('a-b-c')
  })

  it('truncates to 60 characters', () => {
    const long = 'a'.repeat(80)
    expect(slugify(long).length).toBeLessThanOrEqual(60)
  })

  it('handles empty string', () => {
    expect(slugify('')).toBe('')
  })

  it('handles Arabic text', () => {
    // Arabic chars are not a-z0-9 so are replaced
    const result = slugify('مرحبا')
    expect(result).toBe('')
  })

  it('handles mixed latin and numbers', () => {
    expect(slugify('Article 42 de loi')).toBe('article-42-de-loi')
  })
})

// ── resolveErrorMessage ───────────────────────────────────────────────

describe('resolveErrorMessage', () => {
  it('returns string error directly', () => {
    expect(resolveErrorMessage('Custom error')).toBe('Custom error')
  })

  it('extracts body.error from object', () => {
    const err = { body: { error: 'Forbidden' } }
    expect(resolveErrorMessage(err)).toBe('Forbidden')
  })

  it('extracts body.message when body.error is missing', () => {
    const err = { body: { message: 'Not found' } }
    expect(resolveErrorMessage(err)).toBe('Not found')
  })

  it('extracts top-level message', () => {
    const err = { message: 'Timeout' }
    expect(resolveErrorMessage(err)).toBe('Timeout')
  })

  it('falls back to translations.serverError', () => {
    expect(resolveErrorMessage(42, { serverError: 'Erreur serveur' })).toBe('Erreur serveur')
  })

  it('falls back to default French message', () => {
    expect(resolveErrorMessage(null)).toBe('Erreur inattendue.')
  })

  it('ignores empty string error', () => {
    expect(resolveErrorMessage('')).toBe('Erreur inattendue.')
  })

  it('ignores whitespace-only string error', () => {
    expect(resolveErrorMessage('   ')).toBe('Erreur inattendue.')
  })

  it('ignores empty body.error', () => {
    const err = { body: { error: '', message: 'Fallback' } }
    expect(resolveErrorMessage(err)).toBe('Fallback')
  })
})

// ── forwardSetCookies ─────────────────────────────────────────────────

describe('forwardSetCookies', () => {
  it('forwards cookies via getSetCookie()', () => {
    const cookies = ['session=abc; Path=/', 'token=xyz; HttpOnly']
    const source = new Response(null, {
      headers: new Headers(),
    })
    // Monkey-patch getSetCookie on the headers proxy
    ;(source.headers as unknown as { getSetCookie: () => string[] }).getSetCookie = () => cookies

    const target = new Response()
    forwardSetCookies(source, target)

    const forwarded = target.headers.get('set-cookie')
    expect(forwarded).toContain('session=abc')
    expect(forwarded).toContain('token=xyz')
  })

  it('falls back to entries() when getSetCookie is unavailable', () => {
    const source = new Response()
    source.headers.append('set-cookie', 'a=1')
    source.headers.append('other-header', 'ignored')
    // Ensure no getSetCookie method
    ;(source.headers as unknown as { getSetCookie?: unknown }).getSetCookie = undefined

    const target = new Response()
    forwardSetCookies(source, target)

    const forwarded = target.headers.get('set-cookie')
    expect(forwarded).toContain('a=1')
  })

  it('handles empty cookies gracefully', () => {
    const source = new Response()
    ;(source.headers as unknown as { getSetCookie: () => string[] }).getSetCookie = () => []

    const target = new Response()
    forwardSetCookies(source, target)

    expect(target.headers.get('set-cookie')).toBeNull()
  })
})
