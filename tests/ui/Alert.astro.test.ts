import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Alert from '@components/ui/Alert.astro';

test('Alert: rendu avec slot et classes', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Alert, {
    props: { variant: 'modern', color: 'error', title: 'Titre', status: 'error' },
    slots: { default: 'Contenu alerte' },
  });
  expect(result).toContain('Contenu alerte');
  expect(result).toContain('modern');
  expect(result).toContain('error');
  expect(result).toContain('Titre');
});
