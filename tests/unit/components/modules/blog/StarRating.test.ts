import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';

/**
 * Unit tests for StarRating component.
 * Mirrors the component logic in src/components/modules/blog/ui/StarRating.astro
 */

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  variant?: 'initial' | 'retro' | 'modern' | 'futuristic';
  color?: 'default' | 'primary' | 'secondary' | 'accent' | 'error';
  className?: string;
}

function renderStarRating(props: StarRatingProps): string {
  const {
    rating,
    count = 0,
    size = 'sm',
    showCount = true,
    variant = 'initial',
    color = 'primary',
    className = '',
  } = props;

  const stars = [1, 2, 3, 4, 5];
  const roundedRating = Math.round(rating || 0);

  const classes = [
    'star-rating',
    variant !== 'initial' ? variant : '',
    color && color !== 'default' ? `color-${color}` : '',
    `size-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const starsHtml = stars
    .map(
      (star) =>
        `<svg viewBox="0 0 24 24" class="star ${star <= roundedRating ? 'filled' : ''}" role="presentation" focusable="false" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>`,
    )
    .join('');

  const countHtml =
    showCount && count > 0 ? `<span class="count">(${count})</span>` : '';

  return `<div class="${classes}" role="img" aria-label="${roundedRating}/5 (${count} avis)" title="${roundedRating}/5 (${count} avis)">
    <div class="stars" aria-hidden="true">${starsHtml}</div>
    ${countHtml}
  </div>`;
}

describe('StarRating — Rendering', () => {
  it('renders 5 stars', () => {
    const dom = new JSDOM(renderStarRating({ rating: 3 }));
    const stars = dom.window.document.querySelectorAll('.star');
    expect(stars.length).toBe(5);
  });

  it('fills correct number of stars for rating 4', () => {
    const dom = new JSDOM(renderStarRating({ rating: 4 }));
    const filled = dom.window.document.querySelectorAll('.star.filled');
    expect(filled.length).toBe(4);
  });

  it('fills 0 stars for rating 0', () => {
    const dom = new JSDOM(renderStarRating({ rating: 0 }));
    const filled = dom.window.document.querySelectorAll('.star.filled');
    expect(filled.length).toBe(0);
  });

  it('rounds rating to nearest integer', () => {
    const dom = new JSDOM(renderStarRating({ rating: 3.7 }));
    const filled = dom.window.document.querySelectorAll('.star.filled');
    expect(filled.length).toBe(4);
  });

  it('rounds down for 2.3', () => {
    const dom = new JSDOM(renderStarRating({ rating: 2.3 }));
    const filled = dom.window.document.querySelectorAll('.star.filled');
    expect(filled.length).toBe(2);
  });

  it('handles undefined/NaN rating gracefully', () => {
    const dom = new JSDOM(renderStarRating({ rating: NaN }));
    const filled = dom.window.document.querySelectorAll('.star.filled');
    expect(filled.length).toBe(0);
  });
});

describe('StarRating — Count display', () => {
  it('shows count when showCount=true and count > 0', () => {
    const dom = new JSDOM(renderStarRating({ rating: 3, count: 42, showCount: true }));
    const countEl = dom.window.document.querySelector('.count');
    expect(countEl).toBeTruthy();
    expect(countEl!.textContent).toBe('(42)');
  });

  it('hides count when showCount=false', () => {
    const dom = new JSDOM(renderStarRating({ rating: 3, count: 42, showCount: false }));
    const countEl = dom.window.document.querySelector('.count');
    expect(countEl).toBeNull();
  });

  it('hides count when count=0', () => {
    const dom = new JSDOM(renderStarRating({ rating: 3, count: 0, showCount: true }));
    const countEl = dom.window.document.querySelector('.count');
    expect(countEl).toBeNull();
  });
});

describe('StarRating — Accessibility', () => {
  it('has role="img" on container', () => {
    const dom = new JSDOM(renderStarRating({ rating: 3, count: 10 }));
    const container = dom.window.document.querySelector('.star-rating');
    expect(container?.getAttribute('role')).toBe('img');
  });

  it('has descriptive aria-label', () => {
    const dom = new JSDOM(renderStarRating({ rating: 4, count: 15 }));
    const container = dom.window.document.querySelector('.star-rating');
    expect(container?.getAttribute('aria-label')).toBe('4/5 (15 avis)');
  });

  it('stars have aria-hidden="true"', () => {
    const dom = new JSDOM(renderStarRating({ rating: 3 }));
    const starsContainer = dom.window.document.querySelector('.stars');
    expect(starsContainer?.getAttribute('aria-hidden')).toBe('true');
  });

  it('each star svg has role="presentation"', () => {
    const dom = new JSDOM(renderStarRating({ rating: 2 }));
    const svgs = dom.window.document.querySelectorAll('svg');
    svgs.forEach((svg) => {
      expect(svg.getAttribute('role')).toBe('presentation');
    });
  });
});

describe('StarRating — Variants & classes', () => {
  it('applies variant class', () => {
    for (const variant of ['retro', 'modern', 'futuristic'] as const) {
      const dom = new JSDOM(renderStarRating({ rating: 3, variant }));
      const el = dom.window.document.querySelector('.star-rating');
      expect(el!.classList.contains(variant)).toBe(true);
    }
  });

  it('does not add variant class for initial', () => {
    const dom = new JSDOM(renderStarRating({ rating: 3, variant: 'initial' }));
    const el = dom.window.document.querySelector('.star-rating');
    expect(el!.classList.contains('initial')).toBe(false);
  });

  it('applies color class', () => {
    const dom = new JSDOM(renderStarRating({ rating: 3, color: 'accent' }));
    const el = dom.window.document.querySelector('.star-rating');
    expect(el!.classList.contains('color-accent')).toBe(true);
  });

  it('does not add color class for default', () => {
    const dom = new JSDOM(renderStarRating({ rating: 3, color: 'default' }));
    const el = dom.window.document.querySelector('.star-rating');
    expect(el!.classList.contains('color-default')).toBe(false);
  });

  it('applies size class', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const dom = new JSDOM(renderStarRating({ rating: 3, size }));
      const el = dom.window.document.querySelector('.star-rating');
      expect(el!.classList.contains(`size-${size}`)).toBe(true);
    }
  });

  it('applies custom className', () => {
    const dom = new JSDOM(renderStarRating({ rating: 3, className: 'my-rating' }));
    const el = dom.window.document.querySelector('.star-rating');
    expect(el!.classList.contains('my-rating')).toBe(true);
  });
});
