import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Pagination from '@components/ui/Pagination.astro';

test('Pagination: rendu strict', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Pagination, {
    props: { page: 2, pageCount: 5 },
  });
  expect(result).toContain('2');
  expect(result).toContain('5');
  expect(result).toContain('pagination');
});
