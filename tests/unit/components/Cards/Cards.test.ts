import { describe, it, expect, beforeAll } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import {
  expectHasText,
} from '@tests/helpers/uiTestHelpers';

import ArticleCard from '@components/ui/ArticleCard.astro';
import AdCard from '@components/ui/AdCard.astro';
import EventCard from '@components/ui/EventCard.astro';
import PlaceCard from '@components/ui/PlaceCard.astro';
import ProductCard from '@components/ui/ProductCard.astro';
import ThreadCard from '@components/ui/ThreadCard.astro';

describe('Component: ArticleCard', () => {
  let container: AstroContainer;
  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('renders with required props', async () => {
    const html = await container.renderToString(ArticleCard, {
      props: {
        href: '/blog/test',
        title: 'Test Article',
      },
    });
    expect(html).toBeTruthy();
    expectHasText(html, 'Test Article');
  });

  it('renders with all optional props', async () => {
    const html = await container.renderToString(ArticleCard, {
      props: {
        href: '/blog/test',
        title: 'Full Article',
        summary: 'A summary',
        coverImageUrl: '/images/cover.jpg',
        publishedAt: new Date('2024-01-15'),
        variant: 'modern',
      },
    });
    expect(html).toBeTruthy();
    expectHasText(html, 'Full Article');
    expectHasText(html, 'A summary');
  });

  it('applies variant class', async () => {
    const html = await container.renderToString(ArticleCard, {
      props: {
        href: '/blog/test',
        title: 'Futuristic',
        variant: 'futuristic',
      },
    });
    expect(html).toContain('futuristic');
  });
});

describe('Component: AdCard', () => {
  let container: AstroContainer;
  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('renders with required props', async () => {
    const html = await container.renderToString(AdCard, {
      props: {
        href: '/ads/1',
        title: 'Test Ad',
        createdAt: new Date(),
      },
    });
    expect(html).toBeTruthy();
    expectHasText(html, 'Test Ad');
  });

  it('renders price and condition', async () => {
    const html = await container.renderToString(AdCard, {
      props: {
        href: '/ads/1',
        title: 'Priced Ad',
        price: 150,
        condition: 'New',
        createdAt: new Date(),
      },
    });
    expectHasText(html, 'Priced Ad');
  });
});

describe('Component: EventCard', () => {
  let container: AstroContainer;
  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('renders with required props', async () => {
    const html = await container.renderToString(EventCard, {
      props: {
        href: '/events/1',
        title: 'Community Event',
        startAt: new Date('2024-06-15T10:00:00'),
      },
    });
    expect(html).toBeTruthy();
    expectHasText(html, 'Community Event');
  });

  it('renders paid event with price', async () => {
    const html = await container.renderToString(EventCard, {
      props: {
        href: '/events/1',
        title: 'Paid Event',
        startAt: new Date(),
        isPaid: true,
        price: 25,
      },
    });
    expectHasText(html, 'Paid Event');
  });
});

describe('Component: PlaceCard', () => {
  let container: AstroContainer;
  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('renders with required props', async () => {
    const html = await container.renderToString(PlaceCard, {
      props: {
        href: '/places/cafe',
        title: 'Café Central',
      },
    });
    expect(html).toBeTruthy();
    expectHasText(html, 'Café Central');
  });

  it('renders with rating', async () => {
    const html = await container.renderToString(PlaceCard, {
      props: {
        href: '/places/cafe',
        title: 'Rated Place',
        ratingAvg: 4.5,
        ratingCount: 120,
      },
    });
    expectHasText(html, 'Rated Place');
  });
});

describe('Component: ProductCard', () => {
  let container: AstroContainer;
  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('renders with required props', async () => {
    const html = await container.renderToString(ProductCard, {
      props: {
        href: '/products/1',
        title: 'Widget',
      },
    });
    expect(html).toBeTruthy();
    expectHasText(html, 'Widget');
  });

  it('renders badges and meta', async () => {
    const html = await container.renderToString(ProductCard, {
      props: {
        href: '/products/1',
        title: 'Fancy Widget',
        badges: ['New', 'Sale'],
        meta: ['In Stock'],
        variant: 'retro',
      },
    });
    expectHasText(html, 'Fancy Widget');
  });
});

describe('Component: ThreadCard', () => {
  let container: AstroContainer;
  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('renders with required props', async () => {
    const html = await container.renderToString(ThreadCard, {
      props: {
        href: '/forum/thread-1',
        title: 'Discussion Topic',
      },
    });
    expect(html).toBeTruthy();
    expectHasText(html, 'Discussion Topic');
  });

  it('renders pinned and locked indicators', async () => {
    const html = await container.renderToString(ThreadCard, {
      props: {
        href: '/forum/thread-1',
        title: 'Pinned Thread',
        isPinned: true,
        isLocked: true,
        postCount: 42,
      },
    });
    expectHasText(html, 'Pinned Thread');
  });
});
