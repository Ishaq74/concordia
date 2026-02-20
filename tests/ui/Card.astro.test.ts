import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/test';
import Card from '@components/ui/Card.astro';

describe('Card.astro', () => {
  it('renders slot content and default classes', async () => {
    const container = await AstroContainer.create(Card, {
      slots: { default: '<p>Card content</p>' },
    });
    const el = container.element('div');
    expect(el).toBeTruthy();
    expect(el.classList.contains('card')).toBe(true);
    expect(container.html()).toContain('Card content');
  });

  it('applies variant and color props', async () => {
    const container = await AstroContainer.create(Card, {
      props: { variant: 'futuristic', color: 'accent', className: 'custom-card' },
      slots: { default: '<p>Card</p>' },
    });
    const el = container.element('div');
    expect(el.classList.contains('futuristic')).toBe(true);
    expect(el.classList.contains('accent')).toBe(true);
    expect(el.classList.contains('custom-card')).toBe(true);
  });

  it('renders with role and aria-label for a11y', async () => {
    const container = await AstroContainer.create(Card, {
      props: { 'aria-label': 'Card', role: 'region' },
      slots: { default: '<p>Card</p>' },
    });
    const el = container.element('div');
    expect(el.getAttribute('aria-label')).toBe('Card');
    expect(el.getAttribute('role')).toBe('region');
  });
});
