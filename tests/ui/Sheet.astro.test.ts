import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Sheet from '@components/ui/Sheet.astro';

test('Sheet: rendu drawer ouvert', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Sheet, {
    props: { open: true },
    slots: { default: 'Contenu Sheet' },
  });
  expect(result).toContain('Contenu Sheet');
  expect(result).toContain('sheet');
});
