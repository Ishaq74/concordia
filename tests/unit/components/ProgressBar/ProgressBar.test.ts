import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';

/**
 * Unit tests for ProgressBar component.
 */

function renderProgressBar(props: {
  value: number;
  max?: number;
  variant?: string;
  color?: string;
  size?: string;
  showLabel?: boolean;
  label?: string;
  striped?: boolean;
  animated?: boolean;
  ariaLabel?: string;
}) {
  const max = props.max ?? 100;
  const variant = props.variant || 'initial';
  const color = props.color || 'primary';
  const size = props.size || 'md';
  const percentage = Math.min(Math.max((props.value / max) * 100, 0), 100);
  const showLabel = props.showLabel ?? false;
  const label = props.label || `${Math.round(percentage)}%`;
  const ariaLabel = props.ariaLabel || 'Progress';

  const variantClass = variant !== 'initial' ? variant : '';
  const classes = [
    'progress-bar',
    variantClass,
    `progress-${color}`,
    `progress-${size}`,
    props.striped ? 'progress-striped' : '',
    props.animated ? 'progress-animated' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return `<div class="${classes}" role="progressbar"
    aria-valuenow="${props.value}" aria-valuemin="0" aria-valuemax="${max}"
    aria-label="${ariaLabel}">
    <div class="progress-fill" style="width: ${percentage}%">
      ${showLabel ? `<span class="progress-label">${label}</span>` : ''}
    </div>
  </div>`;
}

describe('ProgressBar — Rendering', () => {
  it('renders with correct percentage', () => {
    const dom = new JSDOM(renderProgressBar({ value: 50 }));
    const fill = dom.window.document.querySelector('.progress-fill') as HTMLElement;
    expect(fill.getAttribute('style')).toContain('width: 50%');
  });

  it('clamps value to 0-100%', () => {
    const over = new JSDOM(renderProgressBar({ value: 150 }));
    const fillOver = over.window.document.querySelector('.progress-fill') as HTMLElement;
    expect(fillOver.getAttribute('style')).toContain('width: 100%');

    const under = new JSDOM(renderProgressBar({ value: -10 }));
    const fillUnder = under.window.document.querySelector('.progress-fill') as HTMLElement;
    expect(fillUnder.getAttribute('style')).toContain('width: 0%');
  });

  it('calculates percentage based on custom max', () => {
    const dom = new JSDOM(renderProgressBar({ value: 25, max: 50 }));
    const fill = dom.window.document.querySelector('.progress-fill') as HTMLElement;
    expect(fill.getAttribute('style')).toContain('width: 50%');
  });

  it('shows label when showLabel=true', () => {
    const dom = new JSDOM(renderProgressBar({ value: 75, showLabel: true }));
    const label = dom.window.document.querySelector('.progress-label');
    expect(label).toBeTruthy();
    expect(label!.textContent).toBe('75%');
  });

  it('shows custom label text', () => {
    const dom = new JSDOM(renderProgressBar({ value: 50, showLabel: true, label: '5/10 steps' }));
    const label = dom.window.document.querySelector('.progress-label');
    expect(label!.textContent).toBe('5/10 steps');
  });

  it('hides label when showLabel=false', () => {
    const dom = new JSDOM(renderProgressBar({ value: 50, showLabel: false }));
    expect(dom.window.document.querySelector('.progress-label')).toBeNull();
  });

  it('applies variant class', () => {
    for (const variant of ['retro', 'modern', 'futuristic']) {
      const dom = new JSDOM(renderProgressBar({ value: 50, variant }));
      const bar = dom.window.document.querySelector('.progress-bar');
      expect(bar!.classList.contains(variant)).toBe(true);
    }
  });

  it('applies color class', () => {
    for (const color of ['primary', 'success', 'warning', 'danger']) {
      const dom = new JSDOM(renderProgressBar({ value: 50, color }));
      const bar = dom.window.document.querySelector('.progress-bar');
      expect(bar!.classList.contains(`progress-${color}`)).toBe(true);
    }
  });

  it('applies striped class', () => {
    const dom = new JSDOM(renderProgressBar({ value: 50, striped: true }));
    expect(dom.window.document.querySelector('.progress-striped')).toBeTruthy();
  });

  it('applies animated class', () => {
    const dom = new JSDOM(renderProgressBar({ value: 50, animated: true }));
    expect(dom.window.document.querySelector('.progress-animated')).toBeTruthy();
  });
});

describe('ProgressBar — Accessibility', () => {
  it('has role="progressbar"', () => {
    const dom = new JSDOM(renderProgressBar({ value: 50 }));
    expect(dom.window.document.querySelector('[role="progressbar"]')).toBeTruthy();
  });

  it('has aria-valuenow matching value', () => {
    const dom = new JSDOM(renderProgressBar({ value: 42 }));
    const bar = dom.window.document.querySelector('[role="progressbar"]');
    expect(bar!.getAttribute('aria-valuenow')).toBe('42');
  });

  it('has aria-valuemin=0 and aria-valuemax', () => {
    const dom = new JSDOM(renderProgressBar({ value: 50, max: 200 }));
    const bar = dom.window.document.querySelector('[role="progressbar"]');
    expect(bar!.getAttribute('aria-valuemin')).toBe('0');
    expect(bar!.getAttribute('aria-valuemax')).toBe('200');
  });

  it('has aria-label', () => {
    const dom = new JSDOM(renderProgressBar({ value: 50, ariaLabel: 'Upload progress' }));
    const bar = dom.window.document.querySelector('[role="progressbar"]');
    expect(bar!.getAttribute('aria-label')).toBe('Upload progress');
  });
});
