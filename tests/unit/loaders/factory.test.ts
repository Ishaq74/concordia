import { describe, it, expect, vi } from 'vitest'
import { createTranslationLoader } from '@/database/loaders/factory'

describe('createTranslationLoader (unit)', () => {
  it('stores translated entries with id "slug-lang" and includes slug/lang in data', async () => {
    const fetcher = vi.fn(async () => [
      {
        slug: 'post-xyz',
        translations: [ { inLanguage: 'fr', headline: 'Titre FR', articleBody: 'Contenu FR' } ]
      }
    ])

    const transformer = (entity: any, translation: any) => ({
      title: translation.headline,
      content: translation.articleBody,
    })

    const loader = createTranslationLoader({ fetcher, transformer, langField: 'inLanguage' } as any)

    const store = { set: vi.fn() }
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }

    // @ts-ignore - call internal loader
    await loader.load({ store, logger })

    expect(store.set).toHaveBeenCalledTimes(1)
    const callArg = (store.set as any).mock.calls[0][0]
    expect(callArg.id).toBe('post-xyz-fr')
    expect(callArg.data.slug).toBe('post-xyz')
    expect(callArg.data.lang).toBe('fr')
    expect(callArg.data.title).toBe('Titre FR')
  })

  it('logs and continues when translations missing or empty', async () => {
    const fetcher = vi.fn(async () => [ { slug: 'no-trans', translations: [] } ])
    const transformer = vi.fn()
    const loader = createTranslationLoader({ fetcher, transformer, langField: 'inLanguage' } as any)

    const store = { set: vi.fn() }
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }

    // Should not throw
    // @ts-ignore
    await loader.load({ store, logger })

    expect(logger.warn).toHaveBeenCalled()
    expect(store.set).not.toHaveBeenCalled()
  })

  it('logs error and continues if transformer throws', async () => {
    const fetcher = vi.fn(async () => [
      { slug: 'err-post', translations: [ { inLanguage: 'fr', headline: 'Titre', articleBody: 'Contenu' } ] }
    ])
    const transformer = vi.fn(() => { throw new Error('fail') })
    const loader = createTranslationLoader({ fetcher, transformer, langField: 'inLanguage' } as any)
    const store = { set: vi.fn() }
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
    // @ts-ignore
    await loader.load({ store, logger })
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('fail'))
    expect(store.set).not.toHaveBeenCalled()
  })

  it('handles multiple translations and languages', async () => {
    const fetcher = vi.fn(async () => [
      {
        slug: 'multi',
        translations: [
          { inLanguage: 'fr', headline: 'FR', articleBody: 'Contenu FR' },
          { inLanguage: 'en', headline: 'EN', articleBody: 'EN Content' }
        ]
      }
    ])
    const transformer = (entity: any, translation: any) => ({ title: translation.headline })
    const loader = createTranslationLoader({ fetcher, transformer, langField: 'inLanguage' } as any)
    const store = { set: vi.fn() }
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
    // @ts-ignore
    await loader.load({ store, logger })
    expect(store.set).toHaveBeenCalledTimes(2)
    const ids = (store.set as any).mock.calls.map((c: any) => c[0].id)
    expect(ids).toContain('multi-fr')
    expect(ids).toContain('multi-en')
  })

  it('logs error on missing lang key in translation', async () => {
    const fetcher = vi.fn(async () => [
      { slug: 'badlang', translations: [ { headline: 'NoLang', articleBody: '...' } ] }
    ])
    const transformer = (entity: any, translation: any) => ({ title: translation.headline })
    const loader = createTranslationLoader({ fetcher, transformer, langField: 'inLanguage' } as any)
    const store = { set: vi.fn() }
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
    // @ts-ignore
    await loader.load({ store, logger })
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Missing language key'))
    expect(store.set).not.toHaveBeenCalled()
  })

  it('logs error if two translations produce same id', async () => {
    const fetcher = vi.fn(async () => [
      {
        slug: 'dup',
        translations: [
          { inLanguage: 'fr', headline: 'A', articleBody: 'A' },
          { inLanguage: 'fr', headline: 'B', articleBody: 'B' }
        ]
      }
    ])
    const transformer = (entity: any, translation: any) => ({ title: translation.headline })
    const loader = createTranslationLoader({ fetcher, transformer, langField: 'inLanguage' } as any)
    const store = { set: vi.fn() }
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
    // Patch store.set to throw on duplicate id
    let ids = new Set()
    store.set = vi.fn(arg => {
      if (ids.has(arg.id)) throw new Error('Duplicate id')
      ids.add(arg.id)
    })
    // @ts-ignore
    await loader.load({ store, logger })
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Duplicate id'))
  })
})
