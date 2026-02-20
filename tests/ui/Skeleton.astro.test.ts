import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Skeleton from '@components/ui/Skeleton.astro';

test('Skeleton: rendu', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Skeleton);
  expect(result).toContain('skeleton');
});
