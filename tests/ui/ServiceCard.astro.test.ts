import { expect, test } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ServiceCard from '@components/ui/ServiceCard.astro';

test('ServiceCard: rendu avec slots', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(ServiceCard, {
    slots: { default: '<h3>Service Name</h3><p>Description</p>' }
  });
  expect(html).toContain('service-card');
  expect(html).toContain('Service Name');
  expect(html).toContain('Description');
});

test('ServiceCard: props variant et color', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(ServiceCard, {
    props: { variant: 'modern', color: 'accent', className: 'custom-service' },
    slots: { default: '<h3>Service</h3>' }
  });
  expect(html).toContain('modern');
  expect(html).toContain('accent');
  expect(html).toContain('custom-service');
});

test('ServiceCard: a11y role et aria-label', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(ServiceCard, {
    props: { 'aria-label': 'Service', role: 'region' },
    slots: { default: '<h3>Service</h3>' }
  });
  expect(html).toContain('aria-label="Service"');
  expect(html).toContain('role="region"');
});
