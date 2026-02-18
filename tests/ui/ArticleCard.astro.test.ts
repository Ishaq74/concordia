import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import ArticleCard from '@components/ui/ArticleCard.astro';

test('ArticleCard: rendu strict', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(ArticleCard, {
    props: { title: 'Article', description: 'Desc', variant: 'retro' },
    slots: { default: 'Contenu article' },
  });
  expect(result).toContain('Article');
  expect(result).toContain('Desc');
  expect(result).toContain('retro');
  expect(result).toContain('Contenu article');
});
