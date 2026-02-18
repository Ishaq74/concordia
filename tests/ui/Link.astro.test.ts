import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Link from '@components/ui/Link.astro';

test('Link: rendu strict', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Link, {
    props: { href: '/test', variant: 'modern' },
    slots: { default: 'Lien test' },
  });
  expect(result).toContain('Lien test');
  expect(result).toContain('modern');
  expect(result).toContain('/test');
});
