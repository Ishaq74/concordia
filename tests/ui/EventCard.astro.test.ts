import { expect, test } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import EventCard from '@components/ui/EventCard.astro';

test('EventCard: rendu avec slots', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(EventCard, {
    slots: { default: '<h3>Event Title</h3><p>Date: 2026-02-18</p>' }
  });
  expect(html).toContain('event-card');
  expect(html).toContain('Event Title');
  expect(html).toContain('2026-02-18');
});

test('EventCard: props variant et color', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(EventCard, {
    props: { variant: 'modern', color: 'accent', className: 'custom-event' },
    slots: { default: '<h3>Event</h3>' }
  });
  expect(html).toContain('modern');
  expect(html).toContain('accent');
  expect(html).toContain('custom-event');
});

test('EventCard: a11y role et aria-label', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(EventCard, {
    props: { 'aria-label': 'Event', role: 'article' },
    slots: { default: '<h3>Event</h3>' }
  });
  expect(html).toContain('aria-label="Event"');
  expect(html).toContain('role="article"');
});
