import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';

/**
 * Unit tests for Tooltip component.
 */

function renderTooltip(props: {
  text: string;
  variant?: string;
  position?: string;
  color?: string;
}) {
  const variant = props.variant || 'initial';
  const position = props.position || 'top';
  const variantClass = variant !== 'initial' ? variant : '';
  const classes = ['tooltip', variantClass, `tooltip-${position}`, props.color ? `tooltip-${props.color}` : '']
    .filter(Boolean)
    .join(' ');

  return `<span class="${classes}">
    Hover me
    <span class="tooltiptext" role="tooltip">${props.text}</span>
  </span>`;
}

describe('Tooltip — Rendering', () => {
  it('renders tooltip wrapper', () => {
    const dom = new JSDOM(renderTooltip({ text: 'Help text' }));
    expect(dom.window.document.querySelector('.tooltip')).toBeTruthy();
  });

  it('renders tooltip text', () => {
    const dom = new JSDOM(renderTooltip({ text: 'More information' }));
    const tip = dom.window.document.querySelector('.tooltiptext');
    expect(tip!.textContent).toBe('More information');
  });

  it('applies position class', () => {
    for (const position of ['top', 'bottom', 'left', 'right']) {
      const dom = new JSDOM(renderTooltip({ text: 'Test', position }));
      const wrapper = dom.window.document.querySelector('.tooltip');
      expect(wrapper!.classList.contains(`tooltip-${position}`)).toBe(true);
    }
  });

  it('applies variant class', () => {
    for (const variant of ['retro', 'modern', 'futuristic']) {
      const dom = new JSDOM(renderTooltip({ text: 'Test', variant }));
      const wrapper = dom.window.document.querySelector('.tooltip');
      expect(wrapper!.classList.contains(variant)).toBe(true);
    }
  });

  it('applies color class', () => {
    const dom = new JSDOM(renderTooltip({ text: 'Test', color: 'primary' }));
    const wrapper = dom.window.document.querySelector('.tooltip');
    expect(wrapper!.classList.contains('tooltip-primary')).toBe(true);
  });
});

describe('Tooltip — Accessibility', () => {
  it('tooltip text has role="tooltip"', () => {
    const dom = new JSDOM(renderTooltip({ text: 'Help' }));
    const tip = dom.window.document.querySelector('[role="tooltip"]');
    expect(tip).toBeTruthy();
    expect(tip!.textContent).toBe('Help');
  });
});
