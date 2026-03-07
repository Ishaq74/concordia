import { describe, it, expect, beforeAll } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Badge from '@components/ui/Badge.astro';
import {
  expectHasClass,
  expectHasAttribute,
  expectHasText,
  expectHTMLStructure,
  expectSecurity,
  expectSemantics,
  expectBoundary,
  expectSnapshot,
  expectAria
} from '@tests/helpers/uiTestHelpers';

describe('Component: Badge', () => {
  let container: AstroContainer;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('should render correctly with default props', async () => {
    const html = await container.renderToString(Badge, {
      slots: { default: 'Default Badge' },
    });

    expectHTMLStructure(html);
    expectHasClass(html, 'badge');
    expectHasText(html, 'Default Badge');
    expectSnapshot(html, 'Badge-default');
  });

  it('should apply variant and color classes', async () => {
    const html = await container.renderToString(Badge, {
      props: { variant: 'futuristic', color: 'accent' },
      slots: { default: 'Futuristic Accent' },
    });

    expectHasClass(html, 'badge');
    expectHasClass(html, 'futuristic');
    expectHasClass(html, 'accent');
    expectSnapshot(html, 'Badge-futuristic-accent');
  });

  it('should render the text prop instead of slot', async () => {
    const html = await container.renderToString(Badge, {
      props: { text: 'Prop Text' },
      slots: { default: 'Slot Text' },
    });

    expectHasText(html, 'Prop Text');
    expect(html).not.toContain('Slot Text');
  });

  it('should render a left icon', async () => {
    const html = await container.renderToString(Badge, {
      props: { icon: { name: 'mdi:star', side: 'left' } },
      slots: { default: 'Star Badge' },
    });

    expect(html).toContain('mdi:star');
  });

  it('should render a right icon', async () => {
    const html = await container.renderToString(Badge, {
      props: { icon: { name: 'mdi:heart', side: 'right' } },
      slots: { default: 'Heart Badge' },
    });

    expect(html).toContain('mdi:heart');
  });

  it('should render a dismissible button when enabled', async () => {
    const html = await container.renderToString(Badge, {
      props: { dismissible: true },
      slots: { default: 'Dismissible Badge' },
    });

    expect(html).toContain('<button');
    expect(html).toContain('aria-label="Fermer"');
    expect(html).toContain('mdi:close');
  });

  it('should apply custom className', async () => {
    const html = await container.renderToString(Badge, {
      props: { className: 'my-custom-badge' },
      slots: { default: 'Custom' },
    });

    expectHasClass(html, 'my-custom-badge');
  });

  it('should apply aria-label correctly', async () => {
    const html = await container.renderToString(Badge, {
      props: { ariaLabel: 'Notification count: 5' },
      slots: { default: '5' },
    });

    expectHasAttribute(html, 'aria-label', 'Notification count: 5');
    expectAria(html, { requiredAttributes: ['aria-label'], strict: false });
  });

  it('should pass security checks', async () => {
    const html = await container.renderToString(Badge, {
      props: { text: 'Safe Text' },
    });

    expectSecurity(html);
  });

  it('should pass semantics checks', async () => {
    const html = await container.renderToString(Badge, {
      slots: { default: 'Semantic' },
    });

      expectSemantics(html, { strict: false, forbiddenTags: ['font', 'center', 'u', 'b', 'i'], requiredTags: ['span'] });
  });

  it('should handle boundary cases', async () => {
    const unicodeText = '🚀🌟👨‍🚀';
    const html = await container.renderToString(Badge, {
      props: { text: unicodeText },
    });

    // @ts-ignore: expectBoundary accepte options en 3e argument
    expectBoundary(html, unicodeText, { type: 'unicode', shouldContain: true });
  });
});

