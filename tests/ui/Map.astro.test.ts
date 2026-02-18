import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Map from '@components/ui/Map.astro';

test('Map: rendu strict', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Map, {
    props: { lat: 48.85, lng: 2.35, zoom: 10 },
  });
  expect(result).toContain('48.85');
  expect(result).toContain('2.35');
  expect(result).toContain('map');
});
