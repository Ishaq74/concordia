import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/test';
import Breadcrumb from '@components/ui/Breadcrumb.astro';

describe('Breadcrumb.astro', () => {
  it('renders breadcrumb items from slot', async () => {
    const container = await AstroContainer.create(Breadcrumb, {
      slots: { default: '<li>Home</li><li>Section</li><li>Page</li>' },
    });
    const nav = container.element('nav');
    expect(nav).toBeTruthy();
    expect(container.html()).toContain('Home');
    expect(container.html()).toContain('Section');
    expect(container.html()).toContain('Page');
  });

  it('applies variant and className props', async () => {
    const container = await AstroContainer.create(Breadcrumb, {
      props: { variant: 'modern', className: 'custom-breadcrumb' },
      slots: { default: '<li>Home</li>' },
    });
    const nav = container.element('nav');
    expect(nav.classList.contains('modern')).toBe(true);
    expect(nav.classList.contains('custom-breadcrumb')).toBe(true);
  });

  it('renders aria-label for accessibility', async () => {
    const container = await AstroContainer.create(Breadcrumb, {
      slots: { default: '<li>Home</li>' },
    });
    const nav = container.element('nav');
    expect(nav.getAttribute('aria-label')).toBe('Breadcrumb');
  });
});
