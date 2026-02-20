import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/test';
import Avatar from '@components/ui/Avatar.astro';

// Strict test: props, slot, class, and variant assertions

describe('Avatar.astro', () => {
  it('renders with default props and slot', async () => {
    const container = await AstroContainer.create(Avatar, {
      slots: { default: '<img src="/images/avatars/user.png" alt="User" />' },
    });
    const el = container.element('div');
    expect(el).toBeTruthy();
    expect(el.classList.contains('avatar')).toBe(true);
    expect(container.html()).toContain('<img');
    expect(container.html()).toContain('src="/images/avatars/user.png"');
  });

  it('applies variant and className props', async () => {
    const container = await AstroContainer.create(Avatar, {
      props: { variant: 'retro', className: 'custom-avatar' },
      slots: { default: '<img src="/images/avatars/user.png" alt="User" />' },
    });
    const el = container.element('div');
    expect(el.classList.contains('retro')).toBe(true);
    expect(el.classList.contains('custom-avatar')).toBe(true);
  });

  it('renders alt text for accessibility', async () => {
    const container = await AstroContainer.create(Avatar, {
      slots: { default: '<img src="/images/avatars/user.png" alt="Accessible" />' },
    });
    const img = container.element('img');
    expect(img.getAttribute('alt')).toBe('Accessible');
  });
});
