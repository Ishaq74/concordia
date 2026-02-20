import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Button from '@components/ui/Button.astro';

test('Button: rendu avec slot et classes', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Button, {
    props: { variant: 'retro', color: 'primary' },
    slots: { default: 'Texte bouton' },
  });
  expect(result).toContain('Texte bouton');
  expect(result).toContain('retro');
  expect(result).toContain('primary');
});
