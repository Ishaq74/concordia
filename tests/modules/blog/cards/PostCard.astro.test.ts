import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import PostCard from '@components/modules/blog/cards/PostCard.astro';

// minimal post data fixture
const fakePost = {
  data: {
    slug: 'test-post',
    title: 'Test Post',
    cover: { url: 'https://placehold.co/400x300', alt: 'cover' },
    categories: [{ name: 'Test', slug: 'test' }],
    publishedAt: new Date('2025-01-01'),
    readingTime: '5 min',
    authors: [{ name: 'Alice', slug: 'alice' }],
    excerpt: 'An excerpt',
  },
  ownerId: 'user-1',
  id: 'test-post-fr',
  status: 'draft',
};

test('PostCard renders with metadata and admin buttons when user owner', async () => {
  const container = await AstroContainer.create();

  const html = await container.renderToString(PostCard, {
    props: { post: fakePost, lang: 'fr' },
    locals: { user: { id: 'user-1', role: 'user' } }
  });

  // ensure footer alignment rule present
  expect(html).toMatch(/post-footer[\s\S]*align-items:flex-start/);
  // date should appear in the flex container with flex class
  expect(html).toContain('post-cats-date');
  expect(html).not.toContain('post-categories');
  expect(html).toContain('class="post-date"');
  expect(html).toContain('14 déc'); // short month format from header
  // footer metadata should still include reading time but no date
  expect(html).not.toContain('<time');
  expect(html).toContain('5 min');
  // actions should render (edit & publish)
  expect(html).toContain('Éditer');
  expect(html).toContain('Publier');
});
