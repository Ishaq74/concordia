import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Grid from '@components/Tools/Grid.astro';

test('Grid: sameHeight prop adds class and forces stretch alignment', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Grid, {
    props: { display: 'grid', sameHeight: true },
    slots: { default: '<div>one</div><div>two</div>' }
  });

  // class must be present
  expect(html).toContain('same-height');

  // inline style should include align-items:stretch
  expect(html).toMatch(/align-items:\s*stretch/);
});
