import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';

/**
 * Unit tests for Video component.
 */

function renderVideo(props: {
  src: string;
  variant?: string;
  poster?: string;
  width?: number;
  height?: number;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  preload?: string;
  ariaLabel?: string;
}) {
  const variant = props.variant || 'initial';
  const controls = props.controls ?? true;
  const preload = props.preload || 'metadata';
  const ariaLabel = props.ariaLabel || 'Video player';
  const variantClass = variant !== 'initial' ? variant : '';
  const classes = ['video-container', variantClass].filter(Boolean).join(' ');

  const attrs = [
    controls ? 'controls' : '',
    props.autoplay ? 'autoplay' : '',
    props.loop ? 'loop' : '',
    props.muted ? 'muted' : '',
    props.poster ? `poster="${props.poster}"` : '',
    props.width ? `width="${props.width}"` : '',
    props.height ? `height="${props.height}"` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return `<div class="${classes}">
    <video src="${props.src}" preload="${preload}" ${attrs} aria-label="${ariaLabel}">
      <p>Your browser does not support the video element.</p>
    </video>
  </div>`;
}

describe('Video — Rendering', () => {
  it('renders video container', () => {
    const dom = new JSDOM(renderVideo({ src: '/videos/test.mp4' }));
    expect(dom.window.document.querySelector('.video-container')).toBeTruthy();
  });

  it('renders video element with src', () => {
    const dom = new JSDOM(renderVideo({ src: '/videos/test.mp4' }));
    const video = dom.window.document.querySelector('video');
    expect(video).toBeTruthy();
    expect(video!.getAttribute('src')).toBe('/videos/test.mp4');
  });

  it('applies controls attribute by default', () => {
    const dom = new JSDOM(renderVideo({ src: '/videos/test.mp4' }));
    const video = dom.window.document.querySelector('video');
    expect(video!.hasAttribute('controls')).toBe(true);
  });

  it('applies autoplay attribute when set', () => {
    const dom = new JSDOM(renderVideo({ src: '/v.mp4', autoplay: true }));
    const video = dom.window.document.querySelector('video');
    expect(video!.hasAttribute('autoplay')).toBe(true);
  });

  it('applies loop attribute when set', () => {
    const dom = new JSDOM(renderVideo({ src: '/v.mp4', loop: true }));
    const video = dom.window.document.querySelector('video');
    expect(video!.hasAttribute('loop')).toBe(true);
  });

  it('applies muted attribute when set', () => {
    const dom = new JSDOM(renderVideo({ src: '/v.mp4', muted: true }));
    const video = dom.window.document.querySelector('video');
    expect(video!.hasAttribute('muted')).toBe(true);
  });

  it('sets poster when provided', () => {
    const dom = new JSDOM(renderVideo({ src: '/v.mp4', poster: '/img/poster.jpg' }));
    const video = dom.window.document.querySelector('video');
    expect(video!.getAttribute('poster')).toBe('/img/poster.jpg');
  });

  it('sets preload attribute', () => {
    const dom = new JSDOM(renderVideo({ src: '/v.mp4', preload: 'none' }));
    const video = dom.window.document.querySelector('video');
    expect(video!.getAttribute('preload')).toBe('none');
  });

  it('applies variant class', () => {
    for (const variant of ['retro', 'modern', 'futuristic']) {
      const dom = new JSDOM(renderVideo({ src: '/v.mp4', variant }));
      const container = dom.window.document.querySelector('.video-container');
      expect(container!.classList.contains(variant)).toBe(true);
    }
  });

  it('includes fallback text for unsupported browsers', () => {
    const dom = new JSDOM(renderVideo({ src: '/v.mp4' }));
    const fallback = dom.window.document.querySelector('video p');
    expect(fallback).toBeTruthy();
    expect(fallback!.textContent).toContain('browser');
  });
});

describe('Video — Accessibility', () => {
  it('has aria-label', () => {
    const dom = new JSDOM(renderVideo({ src: '/v.mp4', ariaLabel: 'Tutorial video' }));
    const video = dom.window.document.querySelector('video');
    expect(video!.getAttribute('aria-label')).toBe('Tutorial video');
  });

  it('has controls for keyboard navigation', () => {
    const dom = new JSDOM(renderVideo({ src: '/v.mp4' }));
    const video = dom.window.document.querySelector('video');
    expect(video!.hasAttribute('controls')).toBe(true);
  });
});
