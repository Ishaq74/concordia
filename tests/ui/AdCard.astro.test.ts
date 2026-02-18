import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import AdCard from '@components/ui/AdCard.astro';

test('AdCard: rendu strict', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(AdCard, {
    props: { title: 'Annonce', description: 'Description test', variant: 'modern' },
    slots: { default: 'Contenu annonce' },
  });
  expect(result).toContain('Annonce');
  expect(result).toContain('Description test');
  expect(result).toContain('modern');
  expect(result).toContain('Contenu annonce');
});
