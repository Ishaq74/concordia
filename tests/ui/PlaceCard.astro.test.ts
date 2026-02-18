import { expect, test } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import PlaceCard from '@components/ui/PlaceCard.astro';

test('PlaceCard: rendu avec slots', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(PlaceCard, {
    slots: { default: '<h3>Place Name</h3><p>Location: Paris</p>' }
  });
  expect(html).toContain('place-card');
  expect(html).toContain('Place Name');
  expect(html).toContain('Paris');
});

test('PlaceCard: props variant et color', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(PlaceCard, {
    props: { variant: 'modern', color: 'accent', className: 'custom-place' },
    slots: { default: '<h3>Place</h3>' }
  });
  expect(html).toContain('modern');
  expect(html).toContain('accent');
  expect(html).toContain('custom-place');
});

test('PlaceCard: a11y role et aria-label', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(PlaceCard, {
    props: { 'aria-label': 'Place', role: 'article' },
    slots: { default: '<h3>Place</h3>' }
  });
  expect(html).toContain('aria-label="Place"');
  expect(html).toContain('role="article"');
});
