import { expect, test } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Tooltip from '@components/ui/Tooltip.astro';

test('Tooltip: rendu avec slots', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Tooltip, {
    slots: { default: '<span>Hover me</span>' }
  });
  expect(html).toContain('tooltip');
  expect(html).toContain('Hover me');
});

test('Tooltip: props variant et className', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Tooltip, {
    props: { variant: 'modern', className: 'custom-tooltip' },
    slots: { default: '<span>Hover</span>' }
  });
  expect(html).toContain('modern');
  expect(html).toContain('custom-tooltip');
});

test('Tooltip: a11y aria-label', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Tooltip, {
    props: { 'aria-label': 'Tooltip' },
    slots: { default: '<span>Hover</span>' }
  });
  expect(html).toContain('aria-label="Tooltip"');
});
