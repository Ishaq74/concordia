import { describe, it, expect, vi, afterEach } from 'vitest'
import { loadBlogPosts } from '@/database/loaders/blog'
import * as drizz from '@database/drizzle'
import * as schema from '@database/schemas'

describe('loadBlogPosts (integration via mocked DB)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('transforms DB row into content store entries (slug-lang ids)', async () => {
    const sample = {
      id: 'post-1',
      slug: 'nice-post',
      isFeatured: false,
      publishedAt: new Date(),
      readingTime: '5 min',
      authors: [],
      categories: [],
      media: [ { type: 'cover', media: { url: '/img/cover.jpg', alt: 'alt', width: '800', height: '400' } } ],
      translations: [
        {
          inLanguage: 'fr',
          headline: 'Titre FR',
          excerpt: 'Extrait FR',
          articleBody: '<p>Contenu FR</p>',
          seoTitle: 'SEO FR',
          seoDescription: 'Desc FR',
          seoKeywords: ['a','b'],
          canonicalUrl: 'https://example.test/nice-post'
        }
      ],
    }

    const fakeDb: any = {
      query: {
        blogPosts: {
          findMany: async (_opts?: any) => [sample],
        },
      },
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      $with: vi.fn(),
      $count: vi.fn(),
      $cache: vi.fn(),
      _: {
        schema: undefined,
        fullSchema: schema as unknown as typeof schema,
        tableNamesMap: {},
        session: {} as any,
      },
      with: vi.fn(),
      selectDistinct: vi.fn(),
      selectDistinctOn: vi.fn(),
      transaction: vi.fn(),
      batch: vi.fn(),
      [Symbol.for('drizzle:PgDatabase')]: true,
      $client: {},
      refreshMaterializedView: vi.fn(),
      execute: vi.fn(),
    }

    const drizzModule = await import('@database/drizzle')
    vi.spyOn(drizzModule, 'getDrizzle').mockResolvedValue(fakeDb)

    const store = { set: vi.fn() }
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }

    // @ts-ignore
    await (loadBlogPosts as any).load({ store, logger })

    expect(store.set).toHaveBeenCalled()
    const call = (store.set as any).mock.calls[0][0]
    expect(call.id).toBe('nice-post-fr')
    expect(call.data.slug).toBe('nice-post')
    expect(call.data.lang).toBe('fr')
    expect(call.data.title).toBe('Titre FR')
  })

  it('handles multiple translations and languages', async () => {
    const sample = {
      id: 'post-2',
      slug: 'multi',
      isFeatured: false,
      publishedAt: new Date(),
      authors: [],
      categories: [],
      media: [],
      translations: [
        { inLanguage: 'fr', headline: 'FR', articleBody: 'Contenu FR' },
        { inLanguage: 'en', headline: 'EN', articleBody: 'EN Content' }
      ],
    }
    const fakeDb: any = {
      query: { blogPosts: { findMany: async () => [sample] } },
      select: vi.fn(), insert: vi.fn(), update: vi.fn(), delete: vi.fn(), $with: vi.fn(), $count: vi.fn(), $cache: vi.fn(),
      _: {
        schema: undefined,
        fullSchema: {
          user: {}, session: {}, account: {}, verification: {}, organization: {}, member: {}, invitation: {}, rateLimit: {}, auditLog: {}, blogPosts: {}, blogAuthors: {}, blogCategories: {}, blogComments: {}, blogMedia: {}, blogOrganizations: {}, blogTranslations: {}, comments: {},
          userRelations: {}, sessionRelations: {}, accountRelations: {}, organizationRelations: {}, memberRelations: {}, invitationRelations: {},
          blogAuthorsRelations: {}, blogAuthorsIndexes: {}, blogCategoriesRelations: {}, blogCategoriesIndexes: {}, blogCommentsRelations: {}, blogCommentsIndexes: {}, blogMediaIndexes: {}, blogOrganizationsIndexes: {}, blogTranslationsRelations: {}, blogTranslationsIndexes: {}, commentsRelations: {}
        },
        tableNamesMap: {},
        session: {} as any,
      },
      with: vi.fn(), selectDistinct: vi.fn(), selectDistinctOn: vi.fn(), transaction: vi.fn(), batch: vi.fn(),
      [Symbol.for('drizzle:PgDatabase')]: true,
      $client: {},
      refreshMaterializedView: vi.fn(),
      execute: vi.fn(),
    }
    const drizzModule = await import('@database/drizzle')
    vi.spyOn(drizzModule, 'getDrizzle').mockResolvedValue(fakeDb)
    const store = { set: vi.fn() }
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
    // @ts-ignore
    await (loadBlogPosts as any).load({ store, logger })
    expect(store.set).toHaveBeenCalledTimes(2)
    const ids = (store.set as any).mock.calls.map((c: any) => c[0].id)
    expect(ids).toContain('multi-fr')
    expect(ids).toContain('multi-en')
  })

  it('logs error and continues if transformer throws', async () => {
    // On crée un loader dédié avec un transformer qui throw
    const { createTranslationLoader } = await import('@/database/loaders/factory')
    const sample = {
      id: 'post-err',
      slug: 'err',
      isFeatured: false,
      publishedAt: new Date(),
      authors: [],
      categories: [],
      media: [],
      translations: [ { inLanguage: 'fr', headline: 'Titre', articleBody: 'Contenu' } ],
    }
    const fakeDb: any = {
      query: { blogPosts: { findMany: async () => [sample] } },
      select: vi.fn(), insert: vi.fn(), update: vi.fn(), delete: vi.fn(), $with: vi.fn(), $count: vi.fn(), $cache: vi.fn(),
      _: {
        schema: undefined,
        fullSchema: {
          user: {}, session: {}, account: {}, verification: {}, organization: {}, member: {}, invitation: {}, rateLimit: {}, auditLog: {}, blogPosts: {}, blogAuthors: {}, blogCategories: {}, blogComments: {}, blogMedia: {}, blogOrganizations: {}, blogTranslations: {}, comments: {},
          userRelations: {}, sessionRelations: {}, accountRelations: {}, organizationRelations: {}, memberRelations: {}, invitationRelations: {},
          blogAuthorsRelations: {}, blogAuthorsIndexes: {}, blogCategoriesRelations: {}, blogCategoriesIndexes: {}, blogCommentsRelations: {}, blogCommentsIndexes: {}, blogMediaIndexes: {}, blogOrganizationsIndexes: {}, blogTranslationsRelations: {}, blogTranslationsIndexes: {}, commentsRelations: {}
        },
        tableNamesMap: {},
        session: {} as any,
      },
      with: vi.fn(), selectDistinct: vi.fn(), selectDistinctOn: vi.fn(), transaction: vi.fn(), batch: vi.fn(),
      [Symbol.for('drizzle:PgDatabase')]: true,
      $client: {},
      refreshMaterializedView: vi.fn(),
      execute: vi.fn(),
    }
    const drizzModule = await import('@database/drizzle')
    vi.spyOn(drizzModule, 'getDrizzle').mockResolvedValue(fakeDb)
    const store = { set: vi.fn() }
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
    // Crée un loader avec un transformer qui throw
    const loader = createTranslationLoader({
      fetcher: async () => [sample],
      transformer: () => { throw new Error('fail') },
    })
    // @ts-ignore
    await loader.load({ store, logger })
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('fail'))
    expect(store.set).not.toHaveBeenCalled()
  })

  it('logs error on missing lang key in translation', async () => {
    const sample = {
      id: 'post-badlang',
      slug: 'badlang',
      isFeatured: false,
      publishedAt: new Date(),
      authors: [],
      categories: [],
      media: [],
      translations: [ { headline: 'NoLang', articleBody: '...' } ],
    }
    const fakeDb: any = {
      query: { blogPosts: { findMany: async () => [sample] } },
      select: vi.fn(), insert: vi.fn(), update: vi.fn(), delete: vi.fn(), $with: vi.fn(), $count: vi.fn(), $cache: vi.fn(),
      _: {
        schema: undefined,
        fullSchema: {
          user: { _: {}, $inferSelect: {}, $inferInsert: {}, getSQL: () => '' },
          session: { _: {}, $inferSelect: {}, $inferInsert: {}, getSQL: () => '' },
          account: { _: {}, $inferSelect: {}, $inferInsert: {}, getSQL: () => '' },
          verification: { _: {}, $inferSelect: {}, $inferInsert: {}, getSQL: () => '' },
          organization: { _: {}, $inferSelect: {}, $inferInsert: {}, getSQL: () => '' },
          member: { _: {}, $inferSelect: {}, $inferInsert: {}, getSQL: () => '' },
          invitation: { _: {}, $inferSelect: {}, $inferInsert: {}, getSQL: () => '' },
          rateLimit: { _: {}, $inferSelect: {}, $inferInsert: {}, getSQL: () => '' },
          auditLog: { _: {}, $inferSelect: {}, $inferInsert: {}, getSQL: () => '' },
          blogPosts: { _: {}, $inferSelect: {}, $inferInsert: {}, getSQL: () => '' },
          blogAuthors: { _: {}, $inferSelect: {}, $inferInsert: {}, getSQL: () => '' },
          blogCategories: { _: {}, $inferSelect: {}, $inferInsert: {}, getSQL: () => '' },
          blogComments: { _: {}, $inferSelect: {}, $inferInsert: {}, getSQL: () => '' },
          blogMedia: { _: {}, $inferSelect: {}, $inferInsert: {}, getSQL: () => '' },
          blogOrganizations: { _: {}, $inferSelect: {}, $inferInsert: {}, getSQL: () => '' },
          blogTranslations: { _: {}, $inferSelect: {}, $inferInsert: {}, getSQL: () => '' },
          comments: { _: {}, $inferSelect: {}, $inferInsert: {}, getSQL: () => '' },
          blogPostAuthors: { _: {}, $inferSelect: {}, $inferInsert: {}, getSQL: () => '' },
          blogPostCategories: { _: {}, $inferSelect: {}, $inferInsert: {}, getSQL: () => '' },
          blogPostMedia: { _: {}, $inferSelect: {}, $inferInsert: {}, getSQL: () => '' },
          userRelations: {}, sessionRelations: {}, accountRelations: {}, organizationRelations: {}, memberRelations: {}, invitationRelations: {},
          blogAuthorsRelations: {}, blogAuthorsIndexes: {}, blogCategoriesRelations: {}, blogCategoriesIndexes: {}, blogCommentsRelations: {}, blogCommentsIndexes: {}, blogMediaIndexes: {}, blogOrganizationsIndexes: {}, blogTranslationsRelations: {}, blogTranslationsIndexes: {}, commentsRelations: {},
          blogPostsRelations: {}, blogPostAuthorsRelations: {}, blogPostCategoriesRelations: {}, blogPostMediaRelations: {},
          blogPostsIndexes: {}, blogPostAuthorsIndexes: {}, blogPostCategoriesIndexes: {}, blogPostMediaIndexes: {}
        },
        tableNamesMap: {},
        session: {} as any,
      },
      with: vi.fn(), selectDistinct: vi.fn(), selectDistinctOn: vi.fn(), transaction: vi.fn(), batch: vi.fn(),
      [Symbol.for('drizzle:PgDatabase')]: true,
      $client: {},
      refreshMaterializedView: vi.fn(),
      execute: vi.fn(),
    }
    const drizzModule = await import('@database/drizzle')
    vi.spyOn(drizzModule, 'getDrizzle').mockResolvedValue(fakeDb)
    const store = { set: vi.fn() }
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
    // @ts-ignore
    await (loadBlogPosts as any).load({ store, logger })
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Missing language key'))
    expect(store.set).not.toHaveBeenCalled()
  })

  it('logs error if two translations produce same id', async () => {
    const sample = {
      id: 'post-dup',
      slug: 'dup',
      isFeatured: false,
      publishedAt: new Date(),
      authors: [],
      categories: [],
      media: [],
      translations: [
        { inLanguage: 'fr', headline: 'A', articleBody: 'A' },
        { inLanguage: 'fr', headline: 'B', articleBody: 'B' }
      ],
    }
    const fakeDb: any = {
      query: { blogPosts: { findMany: async () => [sample] } },
      select: vi.fn(), insert: vi.fn(), update: vi.fn(), delete: vi.fn(), $with: vi.fn(), $count: vi.fn(), $cache: vi.fn(),
      _: {
        schema: undefined,
        fullSchema: {},
        tableNamesMap: {},
        session: {} as any,
      },
      with: vi.fn(), selectDistinct: vi.fn(), selectDistinctOn: vi.fn(), transaction: vi.fn(), batch: vi.fn(),
      [Symbol.for('drizzle:PgDatabase')]: true,
      $client: {},
      refreshMaterializedView: vi.fn(),
      execute: vi.fn(),
    }
    const drizzModule = await import('@database/drizzle')
    vi.spyOn(drizzModule, 'getDrizzle').mockResolvedValue(fakeDb)
    const store = { set: vi.fn() }
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
    // Patch store.set to throw on duplicate id
    let ids = new Set()
    store.set = vi.fn(arg => {
      if (ids.has(arg.id)) throw new Error('Duplicate id')
      ids.add(arg.id)
    })
    // @ts-ignore
    await (loadBlogPosts as any).load({ store, logger })
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Duplicate id'))
  })
})
