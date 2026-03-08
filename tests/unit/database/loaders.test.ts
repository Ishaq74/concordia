import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock getDrizzle for the fetcher calls
const { mockDb } = vi.hoisted(() => {
  const mockDb = {
    query: {
      blogPosts: {
        findMany: vi.fn(),
      },
      servicesListings: {
        findMany: vi.fn(),
      },
    },
  };
  return { mockDb };
});

vi.mock('@database/drizzle', () => ({
  getDrizzle: vi.fn(() => mockDb),
}));

describe('createTranslationLoader (factory)', () => {
  let createTranslationLoader: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('@database/loaders/factory');
    createTranslationLoader = mod.createTranslationLoader;
  });

  function makeStoreAndLogger() {
    const store = {
      entries: new Map<string, any>(),
      set(entry: { id: string; data: any }) {
        this.entries.set(entry.id, entry.data);
      },
    };
    const logger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    return { store, logger };
  }

  it('creates a loader with correct name', () => {
    const loader = createTranslationLoader({
      fetcher: async () => [],
      transformer: (entity: any, t: any) => ({}),
    });
    expect(loader.name).toBe('drizzle-translation-loader');
  });

  it('returns early when fetcher returns empty array', async () => {
    const loader = createTranslationLoader({
      fetcher: async () => [],
      transformer: (entity: any, t: any) => ({}),
    });
    const { store, logger } = makeStoreAndLogger();
    await loader.load({ store, logger } as any);

    expect(store.entries.size).toBe(0);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('AUCUNE')
    );
  });

  it('processes entities with translations into store entries', async () => {
    const loader = createTranslationLoader({
      fetcher: async () => [
        {
          slug: 'my-post',
          id: 'p1',
          translations: [
            { inLanguage: 'fr', title: 'Mon article' },
            { inLanguage: 'en', title: 'My article' },
          ],
        },
      ],
      transformer: (entity: any, t: any) => ({ title: t.title }),
    });
    const { store, logger } = makeStoreAndLogger();
    await loader.load({ store, logger } as any);

    expect(store.entries.size).toBe(2);
    expect(store.entries.get('my-post-fr')).toEqual({
      title: 'Mon article',
      slug: 'my-post',
      lang: 'fr',
    });
    expect(store.entries.get('my-post-en')).toEqual({
      title: 'My article',
      slug: 'my-post',
      lang: 'en',
    });
  });

  it('skips entity if translations is not an array', async () => {
    const loader = createTranslationLoader({
      fetcher: async () => [{ slug: 'bad', translations: null }],
      transformer: () => ({}),
    });
    const { store, logger } = makeStoreAndLogger();
    await loader.load({ store, logger } as any);

    expect(store.entries.size).toBe(0);
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('not an array')
    );
  });

  it('skips entity if translations array is empty', async () => {
    const loader = createTranslationLoader({
      fetcher: async () => [{ slug: 'empty', translations: [] }],
      transformer: () => ({}),
    });
    const { store, logger } = makeStoreAndLogger();
    await loader.load({ store, logger } as any);

    expect(store.entries.size).toBe(0);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('EMPTY translations')
    );
  });

  it('skips translation with missing language key', async () => {
    const loader = createTranslationLoader({
      fetcher: async () => [
        { slug: 'bad-lang', translations: [{ title: 'No lang key' }] },
      ],
      transformer: () => ({}),
    });
    const { store, logger } = makeStoreAndLogger();
    await loader.load({ store, logger } as any);

    expect(store.entries.size).toBe(0);
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Missing language key')
    );
  });

  it('catches transformer errors and logs them', async () => {
    const loader = createTranslationLoader({
      fetcher: async () => [
        { slug: 'err', translations: [{ inLanguage: 'fr' }] },
      ],
      transformer: () => {
        throw new Error('Transform failed');
      },
    });
    const { store, logger } = makeStoreAndLogger();
    await loader.load({ store, logger } as any);

    expect(store.entries.size).toBe(0);
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Transform failed')
    );
  });

  it('uses custom langField option', async () => {
    const loader = createTranslationLoader({
      fetcher: async () => [
        { slug: 'custom', translations: [{ locale: 'ar', title: 'عنوان' }] },
      ],
      transformer: (_e: any, t: any) => ({ title: t.title }),
      langField: 'locale' as any,
    });
    const { store, logger } = makeStoreAndLogger();
    await loader.load({ store, logger } as any);

    expect(store.entries.get('custom-ar')).toEqual({
      title: 'عنوان',
      slug: 'custom',
      lang: 'ar',
    });
  });
});

describe('Blog loader getLabel + transformer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loadBlogPosts returns a loader object', async () => {
    const { loadBlogPosts } = await import('@database/loaders/blog');
    expect(loadBlogPosts).toBeDefined();
    expect(loadBlogPosts.name).toBe('drizzle-translation-loader');
  });

  it('transformer produces correct blog output for fr', async () => {
    // Test the transformer logic by calling the loader with mock data
    mockDb.query.blogPosts.findMany.mockResolvedValue([
      {
        slug: 'test-post',
        id: 'p1',
        publishedAt: new Date('2024-01-01'),
        readingTime: 5,
        isFeatured: false,
        authors: [
          {
            author: {
              slug: 'alice',
              displayName: { fr: 'Alice FR', en: 'Alice EN' },
              bio: { fr: 'Bio FR' },
              avatar: { url: '/img/alice.jpg' },
              avatarUrl: null,
            },
          },
        ],
        categories: [
          {
            category: {
              slug: 'tech',
              name: { fr: 'Technologie', en: 'Technology' },
            },
          },
        ],
        media: [
          {
            type: 'cover',
            media: {
              url: '/img/cover.jpg',
              alt: { fr: 'Couverture' },
              width: 800,
              height: 600,
            },
          },
        ],
        translations: [
          {
            inLanguage: 'fr',
            headline: { fr: 'Mon Article' },
            excerpt: { fr: 'Extrait' },
            articleBody: { fr: 'Contenu complet' },
            seoTitle: { fr: 'SEO Title' },
            seoDescription: { fr: 'SEO Desc' },
            seoKeywords: 'tech,blog',
            canonicalUrl: { fr: '/blog/test-post' },
          },
        ],
      },
    ]);

    const { loadBlogPosts } = await import('@database/loaders/blog');
    const store = {
      entries: new Map<string, any>(),
      set(entry: { id: string; data: any }) {
        this.entries.set(entry.id, entry.data);
      },
    };
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    await loadBlogPosts.load({ store, logger } as any);

    const entry = store.entries.get('test-post-fr');
    expect(entry).toBeDefined();
    expect(entry.title).toBe('Mon Article');
    expect(entry.excerpt).toBe('Extrait');
    expect(entry.authors).toHaveLength(1);
    expect(entry.authors[0].slug).toBe('alice');
    expect(entry.categories).toHaveLength(1);
    expect(entry.categories[0].name).toBe('Technologie');
    expect(entry.cover).toBeDefined();
    expect(entry.cover.url).toBe('/img/cover.jpg');
  });
});

describe('Services loader getLabel + transformer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loadServices returns a loader object', async () => {
    const { loadServices } = await import('@database/loaders/services');
    expect(loadServices).toBeDefined();
    expect(loadServices.name).toBe('drizzle-translation-loader');
  });

  it('transformer produces correct services output for en', async () => {
    mockDb.query.servicesListings.findMany.mockResolvedValue([
      {
        slug: 'massage',
        id: 's1',
        providerId: 'provider-1',
        organizationId: 'org-1',
        status: 'active',
        basePrice: 50,
        priceType: 'fixed',
        currency: 'EUR',
        durationMinutes: 60,
        isMobile: false,
        maxParticipants: 1,
        isFeatured: true,
        displayInHome: true,
        allowReviews: true,
        category: {
          slug: 'wellness',
          name: { fr: 'Bien-être', en: 'Wellness' },
        },
        media: [
          {
            type: 'cover',
            media: {
              url: '/img/massage.jpg',
              alt: { en: 'Massage cover' },
              width: 600,
              height: 400,
            },
          },
          {
            type: 'gallery',
            media: {
              url: '/img/gallery1.jpg',
              alt: { en: 'Gallery 1' },
              width: 400,
              height: 300,
            },
          },
        ],
        reviews: [
          { status: 'approved', parentId: null, rating: 5 },
          { status: 'approved', parentId: null, rating: 4 },
          { status: 'pending', parentId: null, rating: 1 },
        ],
        translations: [
          {
            inLanguage: 'en',
            title: { en: 'Massage Service' },
            description: { en: 'Full description' },
            shortDescription: { en: 'Short desc' },
            seoTitle: { en: 'Massage SEO' },
            seoDescription: { en: 'SEO Desc' },
            seoKeywords: 'massage,wellness',
            canonicalUrl: { en: '/services/massage' },
          },
        ],
      },
    ]);

    const { loadServices } = await import('@database/loaders/services');
    const store = {
      entries: new Map<string, any>(),
      set(entry: { id: string; data: any }) {
        this.entries.set(entry.id, entry.data);
      },
    };
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    await loadServices.load({ store, logger } as any);

    const entry = store.entries.get('massage-en');
    expect(entry).toBeDefined();
    expect(entry.title).toBe('Massage Service');
    expect(entry.category.name).toBe('Wellness');
    expect(entry.cover.url).toBe('/img/massage.jpg');
    expect(entry.gallery).toHaveLength(1);
    expect(entry.reviewCount).toBe(2); // only approved, non-reply
    expect(entry.avgRating).toBe(4.5);
    expect(entry.isFeatured).toBe(true);
  });
});
