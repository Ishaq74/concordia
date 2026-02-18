import { expect, test } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Timeline from '@components/ui/Timeline.astro';

test('Timeline: rendu avec slots', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Timeline, {
    slots: { default: '<li>Step 1</li><li>Step 2</li>' }
  });
  expect(html).toContain('timeline');
  expect(html).toContain('Step 1');
  expect(html).toContain('Step 2');
});

test('Timeline: props variant et className', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Timeline, {
    props: { variant: 'retro', className: 'custom-timeline' },
    slots: { default: '<li>Step</li>' }
  });
  expect(html).toContain('retro');
  expect(html).toContain('custom-timeline');
});

test('Timeline: a11y aria-label', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Timeline, {
    props: { 'aria-label': 'Timeline' },
    slots: { default: '<li>Step</li>' }
  });
  expect(html).toContain('aria-label="Timeline"');
});
