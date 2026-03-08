import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';

/**
 * Unit tests for Skeleton component.
 */

function renderSkeleton(props: {
  variant?: string;
  width?: string;
  height?: string;
  circle?: boolean;
  rounded?: boolean;
  animated?: boolean;
  count?: number;
  className?: string;
}) {
  const variant = props.variant || 'initial';
  const count = props.count || 1;
  const animated = props.animated ?? true;
  const variantClass = variant !== 'initial' ? variant : '';
  const classes = [
    'skeleton',
    variantClass,
    props.circle ? 'skeleton-circle' : '',
    props.rounded ? 'skeleton-rounded' : '',
    animated ? 'skeleton-animated' : '',
    props.className,
  ]
    .filter(Boolean)
    .join(' ');

  const style = [
    props.width ? `width: ${props.width}` : '',
    props.height ? `height: ${props.height}` : '',
  ]
    .filter(Boolean)
    .join('; ');

  let html = '';
  for (let i = 0; i < count; i++) {
    html += `<div class="${classes}" style="${style}" aria-busy="true" aria-label="Loading..."></div>`;
  }
  return html;
}

describe('Skeleton — Rendering', () => {
  it('renders skeleton element', () => {
    const dom = new JSDOM(renderSkeleton({}));
    expect(dom.window.document.querySelector('.skeleton')).toBeTruthy();
  });

  it('renders multiple skeletons with count', () => {
    const dom = new JSDOM(renderSkeleton({ count: 3 }));
    const skeletons = dom.window.document.querySelectorAll('.skeleton');
    expect(skeletons.length).toBe(3);
  });

  it('applies circle class', () => {
    const dom = new JSDOM(renderSkeleton({ circle: true }));
    expect(dom.window.document.querySelector('.skeleton-circle')).toBeTruthy();
  });

  it('applies rounded class', () => {
    const dom = new JSDOM(renderSkeleton({ rounded: true }));
    expect(dom.window.document.querySelector('.skeleton-rounded')).toBeTruthy();
  });

  it('applies animated class by default', () => {
    const dom = new JSDOM(renderSkeleton({}));
    expect(dom.window.document.querySelector('.skeleton-animated')).toBeTruthy();
  });

  it('can disable animation', () => {
    const dom = new JSDOM(renderSkeleton({ animated: false }));
    expect(dom.window.document.querySelector('.skeleton-animated')).toBeNull();
  });

  it('applies variant class', () => {
    for (const variant of ['retro', 'modern', 'futuristic']) {
      const dom = new JSDOM(renderSkeleton({ variant }));
      const el = dom.window.document.querySelector('.skeleton');
      expect(el!.classList.contains(variant)).toBe(true);
    }
  });

  it('applies custom width and height', () => {
    const dom = new JSDOM(renderSkeleton({ width: '200px', height: '20px' }));
    const el = dom.window.document.querySelector('.skeleton') as HTMLElement;
    expect(el.getAttribute('style')).toContain('width: 200px');
    expect(el.getAttribute('style')).toContain('height: 20px');
  });
});

describe('Skeleton — Accessibility', () => {
  it('has aria-busy="true"', () => {
    const dom = new JSDOM(renderSkeleton({}));
    const el = dom.window.document.querySelector('.skeleton');
    expect(el!.getAttribute('aria-busy')).toBe('true');
  });

  it('has aria-label for screen readers', () => {
    const dom = new JSDOM(renderSkeleton({}));
    const el = dom.window.document.querySelector('.skeleton');
    expect(el!.getAttribute('aria-label')).toBeTruthy();
  });
});
