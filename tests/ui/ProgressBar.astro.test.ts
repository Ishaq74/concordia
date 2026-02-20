import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import ProgressBar from '@components/ui/ProgressBar.astro';

test('ProgressBar: rendu avec valeur', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(ProgressBar, {
    props: { value: 42 },
  });
  expect(result).toContain('progress-bar');
  expect(result).toContain('42');
});
