import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';

/**
 * Unit tests for ImageWithFallback component.
 * Mirrors src/components/modules/blog/ui/ImageWithFallback.astro
 */

const COLORS = [
  { bg: '1e293b', txt: 'f8fafc' },
  { bg: 'b91c1c', txt: 'fef2f2' },
  { bg: '0f766e', txt: 'f0fdfa' },
  { bg: '1d4ed8', txt: 'eff6ff' },
  { bg: '7e22ce', txt: 'faf5ff' },
  { bg: 'c2410c', txt: 'fff7ed' },
];

interface ImageProps {
  src?: string | null;
  alt?: string;
  text?: string;
  class?: string;
}

function renderImage(props: ImageProps): string {
  const { src, alt, text = 'Image', class: className } = props;
  const safeText = text || 'Image';
  const colorIndex = safeText.length % COLORS.length;
  const { bg, txt } = COLORS[colorIndex];
  const encodedText = encodeURIComponent(
    safeText.length > 30 ? safeText.substring(0, 30) + '...' : safeText,
  );
  const placeholderUrl = `https://placehold.co/800x600/${bg}/${txt}.png?text=${encodedText}&font=raleway`;
  const initialSrc = src ? src : placeholderUrl;

  return `<img src="${initialSrc}" alt="${alt || safeText}" class="${className || ''}" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='${placeholderUrl}';" />`;
}

describe('ImageWithFallback — Rendering', () => {
  it('renders img element', () => {
    const dom = new JSDOM(renderImage({ src: '/uploads/photo.jpg' }));
    const img = dom.window.document.querySelector('img');
    expect(img).toBeTruthy();
  });

  it('uses provided src when available', () => {
    const dom = new JSDOM(renderImage({ src: '/uploads/photo.jpg' }));
    const img = dom.window.document.querySelector('img');
    expect(img!.getAttribute('src')).toBe('/uploads/photo.jpg');
  });

  it('uses placeholder when src is null', () => {
    const dom = new JSDOM(renderImage({ src: null, text: 'Hello' }));
    const img = dom.window.document.querySelector('img');
    expect(img!.getAttribute('src')).toContain('placehold.co');
  });

  it('uses placeholder when src is undefined', () => {
    const dom = new JSDOM(renderImage({ text: 'Test' }));
    const img = dom.window.document.querySelector('img');
    expect(img!.getAttribute('src')).toContain('placehold.co');
  });
});

describe('ImageWithFallback — Alt text', () => {
  it('uses provided alt', () => {
    const dom = new JSDOM(renderImage({ src: '/a.jpg', alt: 'My photo' }));
    const img = dom.window.document.querySelector('img');
    expect(img!.getAttribute('alt')).toBe('My photo');
  });

  it('falls back to text prop when alt missing', () => {
    const dom = new JSDOM(renderImage({ src: '/a.jpg', text: 'Fallback Title' }));
    const img = dom.window.document.querySelector('img');
    expect(img!.getAttribute('alt')).toBe('Fallback Title');
  });

  it('falls back to "Image" when neither alt nor text provided', () => {
    const dom = new JSDOM(renderImage({ src: '/a.jpg' }));
    const img = dom.window.document.querySelector('img');
    expect(img!.getAttribute('alt')).toBe('Image');
  });
});

describe('ImageWithFallback — Placeholder determinism', () => {
  it('generates deterministic color based on text length', () => {
    const html1 = renderImage({ text: 'ABCDE' }); // length=5 → index 5
    const html2 = renderImage({ text: 'FGHIJ' }); // length=5 → index 5
    const dom1 = new JSDOM(html1);
    const dom2 = new JSDOM(html2);
    const src1 = dom1.window.document.querySelector('img')!.getAttribute('src')!;
    const src2 = dom2.window.document.querySelector('img')!.getAttribute('src')!;
    // Same color palette entry since both texts have length 5
    expect(src1).toContain(COLORS[5 % COLORS.length].bg);
    expect(src2).toContain(COLORS[5 % COLORS.length].bg);
  });

  it('different text lengths produce different colors (when possible)', () => {
    const html1 = renderImage({ text: 'AB' }); // length=2
    const html2 = renderImage({ text: 'ABC' }); // length=3
    const dom1 = new JSDOM(html1);
    const dom2 = new JSDOM(html2);
    const src1 = dom1.window.document.querySelector('img')!.getAttribute('src')!;
    const src2 = dom2.window.document.querySelector('img')!.getAttribute('src')!;
    expect(src1).toContain(COLORS[2].bg);
    expect(src2).toContain(COLORS[3].bg);
  });

  it('truncates text longer than 30 chars in placeholder URL', () => {
    const longText = 'A'.repeat(50);
    const html = renderImage({ text: longText });
    const dom = new JSDOM(html);
    const src = dom.window.document.querySelector('img')!.getAttribute('src')!;
    // should contain encoded "AAA...AAA..." (30 chars + "...")
    expect(src).toContain(encodeURIComponent('A'.repeat(30) + '...'));
  });
});

describe('ImageWithFallback — Performance attributes', () => {
  it('has loading="lazy"', () => {
    const dom = new JSDOM(renderImage({ src: '/a.jpg' }));
    const img = dom.window.document.querySelector('img');
    expect(img!.getAttribute('loading')).toBe('lazy');
  });

  it('has decoding="async"', () => {
    const dom = new JSDOM(renderImage({ src: '/a.jpg' }));
    const img = dom.window.document.querySelector('img');
    expect(img!.getAttribute('decoding')).toBe('async');
  });

  it('has onerror fallback handler', () => {
    const dom = new JSDOM(renderImage({ src: '/a.jpg', text: 'Test' }));
    const img = dom.window.document.querySelector('img');
    const onerror = img!.getAttribute('onerror');
    expect(onerror).toContain('this.onerror=null');
    expect(onerror).toContain('placehold.co');
  });
});

describe('ImageWithFallback — CSS class', () => {
  it('applies custom class', () => {
    const dom = new JSDOM(renderImage({ src: '/a.jpg', class: 'post-image hero' }));
    const img = dom.window.document.querySelector('img');
    expect(img!.classList.contains('post-image')).toBe(true);
    expect(img!.classList.contains('hero')).toBe(true);
  });
});
