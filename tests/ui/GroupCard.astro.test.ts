import { expect, test } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import GroupCard from '@components/ui/GroupCard.astro';

test('GroupCard: rendu avec slots', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(GroupCard, {
    slots: { default: '<h3>Group Name</h3><p>Members: 10</p>' }
  });
  expect(html).toContain('group-card');
  expect(html).toContain('Group Name');
  expect(html).toContain('Members: 10');
});

test('GroupCard: props variant et color', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(GroupCard, {
    props: { variant: 'retro', color: 'secondary', className: 'custom-group' },
    slots: { default: '<h3>Group</h3>' }
  });
  expect(html).toContain('retro');
  expect(html).toContain('secondary');
  expect(html).toContain('custom-group');
});

test('GroupCard: a11y role et aria-label', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(GroupCard, {
    props: { 'aria-label': 'Group', role: 'region' },
    slots: { default: '<h3>Group</h3>' }
  });
  expect(html).toContain('aria-label="Group"');
  expect(html).toContain('role="region"');
});
