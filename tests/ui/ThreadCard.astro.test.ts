import { expect, test } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ThreadCard from '@components/ui/ThreadCard.astro';

test('ThreadCard: rendu avec slots', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(ThreadCard, {
    slots: { default: '<h3>Thread Title</h3><p>Replies: 5</p>' }
  });
  expect(html).toContain('thread-card');
  expect(html).toContain('Thread Title');
  expect(html).toContain('Replies: 5');
});

test('ThreadCard: props variant et color', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(ThreadCard, {
    props: { variant: 'futuristic', color: 'accent', className: 'custom-thread' },
    slots: { default: '<h3>Thread</h3>' }
  });
  expect(html).toContain('futuristic');
  expect(html).toContain('accent');
  expect(html).toContain('custom-thread');
});

test('ThreadCard: a11y role et aria-label', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(ThreadCard, {
    props: { 'aria-label': 'Thread', role: 'article' },
    slots: { default: '<h3>Thread</h3>' }
  });
  expect(html).toContain('aria-label="Thread"');
  expect(html).toContain('role="article"');
});
