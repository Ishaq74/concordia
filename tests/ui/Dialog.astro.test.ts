import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/test';
import Dialog from '@components/ui/Dialog.astro';

describe('Dialog.astro', () => {
  it('renders slot content and dialog role', async () => {
    const container = await AstroContainer.create(Dialog, {
      slots: { default: '<p>Dialog content</p>' },
    });
    const dialog = container.element('dialog');
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(container.html()).toContain('Dialog content');
  });

  it('applies variant and className props', async () => {
    const container = await AstroContainer.create(Dialog, {
      props: { variant: 'modern', className: 'custom-dialog' },
      slots: { default: '<p>Dialog</p>' },
    });
    const dialog = container.element('dialog');
    expect(dialog.classList.contains('modern')).toBe(true);
    expect(dialog.classList.contains('custom-dialog')).toBe(true);
  });

  it('renders aria-modal for accessibility', async () => {
    const container = await AstroContainer.create(Dialog, {
      props: { 'aria-modal': 'true' },
      slots: { default: '<p>Dialog</p>' },
    });
    const dialog = container.element('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });
});
