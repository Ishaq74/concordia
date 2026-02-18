import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import MenuDropdown from '@components/ui/MenuDropdown.astro';

test('MenuDropdown: rendu strict', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(MenuDropdown, {
    props: { items: [{ label: 'Option 1', value: '1' }, { label: 'Option 2', value: '2' }] },
  });
  expect(result).toContain('Option 1');
  expect(result).toContain('Option 2');
  expect(result).toContain('menu');
});
