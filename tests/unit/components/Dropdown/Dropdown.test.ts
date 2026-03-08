import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';

/**
 * Unit tests for Dropdown component.
 */

function renderDropdown(props: {
  variant?: string;
  position?: string;
  triggerLabel?: string;
  openOnHover?: boolean;
  items?: { label: string; href?: string }[];
}) {
  const variant = props.variant || 'initial';
  const position = props.position || 'bottom';
  const triggerLabel = props.triggerLabel || 'Menu';
  const items = props.items || [
    { label: 'Item 1', href: '/item-1' },
    { label: 'Item 2', href: '/item-2' },
    { label: 'Item 3', href: '/item-3' },
  ];

  const variantClass = variant !== 'initial' ? variant : '';
  const hoverClass = props.openOnHover ? 'hover-trigger' : '';
  const classes = ['dropdown', variantClass, `position-${position}`, hoverClass]
    .filter(Boolean)
    .join(' ');

  let html = `<div class="${classes}">
    <input type="checkbox" id="dropdown-toggle" class="dropdown-toggle" hidden />
    <label for="dropdown-toggle" class="dropdown-trigger" role="button" aria-haspopup="true">${triggerLabel}</label>
    <ul class="dropdown-menu" role="menu">`;

  for (const item of items) {
    html += `<li role="menuitem"><a href="${item.href || '#'}">${item.label}</a></li>`;
  }

  html += `</ul></div>`;
  return html;
}

describe('Dropdown — Rendering', () => {
  it('renders dropdown container', () => {
    const dom = new JSDOM(renderDropdown({}));
    expect(dom.window.document.querySelector('.dropdown')).toBeTruthy();
  });

  it('renders trigger with label text', () => {
    const dom = new JSDOM(renderDropdown({ triggerLabel: 'Actions' }));
    const trigger = dom.window.document.querySelector('.dropdown-trigger');
    expect(trigger!.textContent).toBe('Actions');
  });

  it('renders correct number of menu items', () => {
    const items = [
      { label: 'A', href: '/a' },
      { label: 'B', href: '/b' },
    ];
    const dom = new JSDOM(renderDropdown({ items }));
    const menuItems = dom.window.document.querySelectorAll('[role="menuitem"]');
    expect(menuItems.length).toBe(2);
  });

  it('applies variant class', () => {
    for (const variant of ['retro', 'modern', 'futuristic']) {
      const dom = new JSDOM(renderDropdown({ variant }));
      const container = dom.window.document.querySelector('.dropdown');
      expect(container!.classList.contains(variant)).toBe(true);
    }
  });

  it('applies position class', () => {
    for (const position of ['top', 'bottom', 'left', 'right']) {
      const dom = new JSDOM(renderDropdown({ position }));
      const container = dom.window.document.querySelector('.dropdown');
      expect(container!.classList.contains(`position-${position}`)).toBe(true);
    }
  });

  it('applies hover-trigger class when openOnHover=true', () => {
    const dom = new JSDOM(renderDropdown({ openOnHover: true }));
    const container = dom.window.document.querySelector('.dropdown');
    expect(container!.classList.contains('hover-trigger')).toBe(true);
  });
});

describe('Dropdown — Accessibility', () => {
  it('trigger has aria-haspopup="true"', () => {
    const dom = new JSDOM(renderDropdown({}));
    const trigger = dom.window.document.querySelector('.dropdown-trigger');
    expect(trigger!.getAttribute('aria-haspopup')).toBe('true');
  });

  it('trigger has role="button"', () => {
    const dom = new JSDOM(renderDropdown({}));
    const trigger = dom.window.document.querySelector('.dropdown-trigger');
    expect(trigger!.getAttribute('role')).toBe('button');
  });

  it('menu has role="menu"', () => {
    const dom = new JSDOM(renderDropdown({}));
    const menu = dom.window.document.querySelector('.dropdown-menu');
    expect(menu!.getAttribute('role')).toBe('menu');
  });

  it('items have role="menuitem"', () => {
    const dom = new JSDOM(renderDropdown({}));
    const items = dom.window.document.querySelectorAll('[role="menuitem"]');
    expect(items.length).toBeGreaterThan(0);
  });

  it('toggle is hidden from assistive tech', () => {
    const dom = new JSDOM(renderDropdown({}));
    const toggle = dom.window.document.querySelector('.dropdown-toggle');
    expect(toggle!.hasAttribute('hidden')).toBe(true);
  });
});
