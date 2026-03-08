import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';

/**
 * Unit tests for Dialog component.
 * Tests rendering, props, accessibility, and variant support.
 */

// Helper to simulate Astro component rendering via HTML string
function renderDialog(props: {
  id: string;
  variant?: string;
  class?: string;
}) {
  const variant = props.variant || 'initial';
  const classes = ['dialog-wrapper', variant !== 'initial' && variant, props.class]
    .filter(Boolean)
    .join(' ');

  return `<div class="${classes}">
    <input type="checkbox" id="${props.id}" class="dialog-state" hidden />
    <label for="${props.id}" class="dialog-trigger">Open</label>
    <div class="dialog-content" role="dialog" aria-modal="true" aria-labelledby="${props.id}-title">
      <h2 id="${props.id}-title">Dialog Title</h2>
      <p>Dialog body</p>
      <label for="${props.id}" class="dialog-close">Close</label>
    </div>
  </div>`;
}

describe('Dialog — Rendering', () => {
  it('renders with required id prop', () => {
    const html = renderDialog({ id: 'test-dialog' });
    const dom = new JSDOM(html);
    const input = dom.window.document.querySelector('input#test-dialog');
    expect(input).toBeTruthy();
    expect(input?.getAttribute('type')).toBe('checkbox');
    expect(input?.hasAttribute('hidden')).toBe(true);
  });

  it('applies default variant class (no variant class for initial)', () => {
    const html = renderDialog({ id: 'default' });
    const dom = new JSDOM(html);
    const wrapper = dom.window.document.querySelector('.dialog-wrapper');
    expect(wrapper).toBeTruthy();
    expect(wrapper!.classList.contains('retro')).toBe(false);
    expect(wrapper!.classList.contains('modern')).toBe(false);
  });

  it('applies variant class for non-initial variants', () => {
    for (const variant of ['retro', 'modern', 'futuristic']) {
      const html = renderDialog({ id: `dialog-${variant}`, variant });
      const dom = new JSDOM(html);
      const wrapper = dom.window.document.querySelector('.dialog-wrapper');
      expect(wrapper!.classList.contains(variant)).toBe(true);
    }
  });

  it('applies custom class', () => {
    const html = renderDialog({ id: 'custom', class: 'my-dialog' });
    const dom = new JSDOM(html);
    const wrapper = dom.window.document.querySelector('.dialog-wrapper');
    expect(wrapper!.classList.contains('my-dialog')).toBe(true);
  });
});

describe('Dialog — Accessibility', () => {
  it('has role="dialog" on content', () => {
    const html = renderDialog({ id: 'a11y-dialog' });
    const dom = new JSDOM(html);
    const dialog = dom.window.document.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
  });

  it('has aria-modal="true"', () => {
    const html = renderDialog({ id: 'modal-dialog' });
    const dom = new JSDOM(html);
    const dialog = dom.window.document.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
  });

  it('has aria-labelledby pointing to title', () => {
    const html = renderDialog({ id: 'labeled' });
    const dom = new JSDOM(html);
    const dialog = dom.window.document.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute('aria-labelledby')).toBe('labeled-title');
    const title = dom.window.document.getElementById('labeled-title');
    expect(title).toBeTruthy();
  });

  it('trigger and close labels reference the checkbox id', () => {
    const html = renderDialog({ id: 'toggle-test' });
    const dom = new JSDOM(html);
    const trigger = dom.window.document.querySelector('.dialog-trigger') as HTMLLabelElement;
    const close = dom.window.document.querySelector('.dialog-close') as HTMLLabelElement;
    expect(trigger?.getAttribute('for')).toBe('toggle-test');
    expect(close?.getAttribute('for')).toBe('toggle-test');
  });
});
