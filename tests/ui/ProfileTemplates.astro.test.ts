import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';

import ProfileHeader from '@components/templates/auth/profile/ProfileHeader.astro';
import ProfileDetails from '@components/templates/auth/profile/ProfileDetails.astro';
import ProfileForm from '@components/templates/auth/profile/ProfileForm.astro';
import ProfileInvitations from '@components/templates/auth/profile/ProfileInvitations.astro';

// Helper to render an arbitrary component with minimal props/slots
async function render(component: any, props = {}, slots = {}) {
  const container = await AstroContainer.create();
  return container.renderToString(component, { props, slots });
}

test('ProfileHeader defaults to modern primary styling', async () => {
  const html = await render(ProfileHeader, { title: 'Mon Profil' });

  // Grid should have modern and primary variant classes
  expect(html).toContain('u-modern');
  expect(html).toContain('u-primary');
});

test('ProfileDetails is wrapped in a modern card', async () => {
  const html = await render(ProfileDetails, {
    user: { id: '1', name: 'Test', email: 'test@example.com' },
    organizations: [],
    activeOrganizationId: null,
    invitationCount: 0,
  });

  expect(html).toContain('card-modern');
  expect(html).toContain('elevation-sm');
});

test('ProfileForm is wrapped in a modern card', async () => {
  const html = await render(ProfileForm, {
    user: { id: '1', name: 'Test', email: 'test@example.com' },
  });

  expect(html).toContain('card-modern');
  expect(html).toContain('elevation-sm');
  expect(html).toContain('Mettre à jour');
});

test('ProfileInvitations is wrapped in a modern card and shows correct count', async () => {
  const html = await render(ProfileInvitations, { count: 2, translations: {} });

  expect(html).toContain('card-modern');
  expect(html).toContain('2 en attente');
});
