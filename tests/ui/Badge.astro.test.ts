import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Badge from '@components/ui/Badge.astro';

test('Badge: rendu avec slot et classes', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Badge, {
    props: { variant: 'futuristic', color: 'accent' },
    slots: { default: 'Badge test' },
  });
  expect(result).toContain('Badge test');
  expect(result).toContain('futuristic');
  expect(result).toContain('accent');
});
