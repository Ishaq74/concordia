import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Kbd from '@components/ui/Kbd.astro';

test('Kbd: rendu strict', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Kbd, {
    slots: { default: 'Ctrl+C' },
  });
  expect(result).toContain('Ctrl+C');
  expect(result).toContain('kbd');
});
