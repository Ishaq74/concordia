import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Gallery from '@components/ui/Gallery.astro';

test('Gallery: rendu strict', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Gallery, {
    props: { images: [{ src: '/img1.jpg', alt: 'img1' }, { src: '/img2.jpg', alt: 'img2' }] },
  });
  expect(result).toContain('img1');
  expect(result).toContain('img2');
  expect(result).toContain('gallery');
});
