import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import ThemeSwitch from '@components/templates/Header/ThemeSwitch.astro';

test('ThemeSwitch renders markup and includes module script', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(ThemeSwitch, { props: { variant: 'modern' } });
  expect(result).toContain('theme-switch');
  expect(result).toContain('icon-light');
  expect(result).toContain('icon-dark');
  // ensure the script tag references type=module
  expect(result).toMatch(/<script[^>]+type="module"/);
});
