import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';

/**
 * Unit tests for Gallery component.
 */

interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

function renderGallery(props: {
  images: GalleryImage[];
  variant?: string;
  mode?: string;
  columns?: number;
  showCaptions?: boolean;
}) {
  const variant = props.variant || 'initial';
  const mode = props.mode || 'grid';
  const columns = props.columns || 3;
  const showCaptions = props.showCaptions ?? false;
  const variantClass = variant !== 'initial' ? variant : '';
  const classes = ['gallery', variantClass, `gallery-${mode}`, `gallery-cols-${columns}`]
    .filter(Boolean)
    .join(' ');

  let html = `<div class="${classes}" role="region" aria-label="Image gallery">`;
  for (const [idx, img] of props.images.entries()) {
    html += `<figure class="gallery-item">`;
    html += `<img src="${img.src}" alt="${img.alt}" loading="lazy" width="${img.width || ''}" height="${img.height || ''}" />`;
    if (showCaptions && img.caption) {
      html += `<figcaption>${img.caption}</figcaption>`;
    }
    html += `</figure>`;
  }
  html += `</div>`;
  return html;
}

const sampleImages: GalleryImage[] = [
  { src: '/img/1.jpg', alt: 'First image', caption: 'Caption 1', width: 800, height: 600 },
  { src: '/img/2.jpg', alt: 'Second image', caption: 'Caption 2', width: 800, height: 600 },
  { src: '/img/3.jpg', alt: 'Third image', width: 800, height: 600 },
];

describe('Gallery — Rendering', () => {
  it('renders gallery container', () => {
    const dom = new JSDOM(renderGallery({ images: sampleImages }));
    expect(dom.window.document.querySelector('.gallery')).toBeTruthy();
  });

  it('renders correct number of images', () => {
    const dom = new JSDOM(renderGallery({ images: sampleImages }));
    const imgs = dom.window.document.querySelectorAll('img');
    expect(imgs.length).toBe(3);
  });

  it('applies gallery mode class', () => {
    for (const mode of ['grid', 'masonry', 'product']) {
      const dom = new JSDOM(renderGallery({ images: sampleImages, mode }));
      const gallery = dom.window.document.querySelector('.gallery');
      expect(gallery!.classList.contains(`gallery-${mode}`)).toBe(true);
    }
  });

  it('applies column count class', () => {
    const dom = new JSDOM(renderGallery({ images: sampleImages, columns: 4 }));
    const gallery = dom.window.document.querySelector('.gallery');
    expect(gallery!.classList.contains('gallery-cols-4')).toBe(true);
  });

  it('shows captions when enabled', () => {
    const dom = new JSDOM(renderGallery({ images: sampleImages, showCaptions: true }));
    const captions = dom.window.document.querySelectorAll('figcaption');
    expect(captions.length).toBe(2); // Only 2 have captions
  });

  it('hides captions when disabled', () => {
    const dom = new JSDOM(renderGallery({ images: sampleImages, showCaptions: false }));
    expect(dom.window.document.querySelector('figcaption')).toBeNull();
  });

  it('uses figure elements for semantic markup', () => {
    const dom = new JSDOM(renderGallery({ images: sampleImages }));
    const figures = dom.window.document.querySelectorAll('figure');
    expect(figures.length).toBe(3);
  });
});

describe('Gallery — Accessibility', () => {
  it('has role="region" with aria-label', () => {
    const dom = new JSDOM(renderGallery({ images: sampleImages }));
    const gallery = dom.window.document.querySelector('[role="region"]');
    expect(gallery).toBeTruthy();
    expect(gallery!.getAttribute('aria-label')).toBe('Image gallery');
  });

  it('all images have alt attributes', () => {
    const dom = new JSDOM(renderGallery({ images: sampleImages }));
    const imgs = dom.window.document.querySelectorAll('img');
    for (const img of imgs) {
      expect(img.getAttribute('alt')).toBeTruthy();
    }
  });

  it('images use lazy loading', () => {
    const dom = new JSDOM(renderGallery({ images: sampleImages }));
    const imgs = dom.window.document.querySelectorAll('img');
    for (const img of imgs) {
      expect(img.getAttribute('loading')).toBe('lazy');
    }
  });

  it('empty gallery renders without errors', () => {
    const dom = new JSDOM(renderGallery({ images: [] }));
    const gallery = dom.window.document.querySelector('.gallery');
    expect(gallery).toBeTruthy();
    expect(dom.window.document.querySelectorAll('img').length).toBe(0);
  });
});
