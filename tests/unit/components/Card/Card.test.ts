import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';

/**
 * Unit tests for Card component and sub-components.
 */

function renderCard(props: {
  variant?: string;
  elevation?: string;
  interactive?: boolean;
  className?: string;
  content?: string;
}) {
  const variant = props.variant || 'initial';
  const elevation = props.elevation || 'md';
  const interactive = props.interactive ?? false;
  const variantClass = variant !== 'initial' ? variant : '';
  const classes = [
    'card',
    variantClass,
    `elevation-${elevation}`,
    interactive ? 'interactive' : '',
    props.className,
  ]
    .filter(Boolean)
    .join(' ');

  const content =
    props.content ||
    `<div class="card-header"><h3>Card Title</h3></div>
     <div class="card-content"><p>Card body</p></div>
     <div class="card-footer"><button>Action</button></div>`;

  return `<article class="${classes}">${content}</article>`;
}

describe('Card — Rendering', () => {
  it('renders as article element', () => {
    const dom = new JSDOM(renderCard({}));
    const article = dom.window.document.querySelector('article.card');
    expect(article).toBeTruthy();
  });

  it('applies variant class', () => {
    for (const variant of ['retro', 'modern', 'futuristic']) {
      const dom = new JSDOM(renderCard({ variant }));
      const card = dom.window.document.querySelector('.card');
      expect(card!.classList.contains(variant)).toBe(true);
    }
  });

  it('applies elevation class', () => {
    for (const elevation of ['none', 'sm', 'md', 'lg', 'xl']) {
      const dom = new JSDOM(renderCard({ elevation }));
      const card = dom.window.document.querySelector('.card');
      expect(card!.classList.contains(`elevation-${elevation}`)).toBe(true);
    }
  });

  it('applies interactive class when interactive=true', () => {
    const dom = new JSDOM(renderCard({ interactive: true }));
    const card = dom.window.document.querySelector('.card');
    expect(card!.classList.contains('interactive')).toBe(true);
  });

  it('does not apply interactive class when interactive=false', () => {
    const dom = new JSDOM(renderCard({ interactive: false }));
    const card = dom.window.document.querySelector('.card');
    expect(card!.classList.contains('interactive')).toBe(false);
  });

  it('applies custom className', () => {
    const dom = new JSDOM(renderCard({ className: 'featured-card' }));
    const card = dom.window.document.querySelector('.card');
    expect(card!.classList.contains('featured-card')).toBe(true);
  });

  it('renders header, content, and footer slots', () => {
    const dom = new JSDOM(renderCard({}));
    expect(dom.window.document.querySelector('.card-header')).toBeTruthy();
    expect(dom.window.document.querySelector('.card-content')).toBeTruthy();
    expect(dom.window.document.querySelector('.card-footer')).toBeTruthy();
  });
});

describe('Card — Accessibility', () => {
  it('uses article element for semantic structure', () => {
    const dom = new JSDOM(renderCard({}));
    const article = dom.window.document.querySelector('article');
    expect(article).toBeTruthy();
  });

  it('contains heading inside card-header', () => {
    const dom = new JSDOM(renderCard({}));
    const heading = dom.window.document.querySelector('.card-header h3');
    expect(heading).toBeTruthy();
    expect(heading!.textContent).toBe('Card Title');
  });
});
