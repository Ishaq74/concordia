import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, it, expect, beforeAll } from 'vitest';
import Wrapper from '@components/Tools/Wrapper.astro';
import {
  expectHTML,
  expectHasClass,
  expectHasCSS,
  expectSecurity,
  expectDeterminism,
  expectStability,
  expectSnapshot,
} from '@tests/helpers/uiTestHelpers';

describe('Wrapper.astro Component', () => {
  let container: AstroContainer;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  // ═══════════════════════════════════════════════════════════════
  // DEFAULT RENDER
  // ═══════════════════════════════════════════════════════════════

  it('should render a default section with block display', async () => {
    const html = await container.renderToString(Wrapper);
    expectHTML(html, { strict: true, requiredTags: ['section'] });
    expectHasClass(html, 'wrapper-block');
    expectHasClass(html, 'wrapper-variant-initial');
    expectHasClass(html, 'wrapper-color-default');
    expect(html).not.toContain('wrapper-grid');
    expect(html).not.toContain('wrapper-flex');
  });

  // ═══════════════════════════════════════════════════════════════
  // DISPLAY MODES
  // ═══════════════════════════════════════════════════════════════

  describe('All display modes', () => {
    const modes = [
      { display: 'block', cls: 'wrapper-block' },
      { display: 'flex', cls: 'wrapper-flex' },
      { display: 'grid', cls: 'wrapper-grid' },
    ] as const;
    for (const { display, cls } of modes) {
      it(`should render display=${display} with class ${cls}`, async () => {
        const html = await container.renderToString(Wrapper, { props: { display } });
        expectHasClass(html, cls);
      });
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // VARIANTS
  // ═══════════════════════════════════════════════════════════════

  describe('All variants', () => {
    const variants = ['initial', 'retro', 'modern', 'futuristic', 'default', 'primary', 'secondary', 'accent'] as const;
    for (const v of variants) {
      it(`should apply variant class wrapper-variant-${v}`, async () => {
        const html = await container.renderToString(Wrapper, { props: { variant: v } });
        expectHasClass(html, `wrapper-variant-${v}`);
      });
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // COLORS
  // ═══════════════════════════════════════════════════════════════

  describe('All colors', () => {
    const colors = ['default', 'primary', 'secondary', 'accent', 'error'] as const;
    for (const c of colors) {
      it(`should apply color class wrapper-color-${c}`, async () => {
        const html = await container.renderToString(Wrapper, { props: { color: c } });
        expectHasClass(html, `wrapper-color-${c}`);
      });
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // ID PROP
  // ═══════════════════════════════════════════════════════════════

  describe('id prop', () => {
    it('should render id attribute on the element', async () => {
      const html = await container.renderToString(Wrapper, { props: { id: 'hero-section' } });
      expect(html).toContain('id="hero-section"');
    });

    it('should not render id when not provided', async () => {
      const html = await container.renderToString(Wrapper);
      expect(html).not.toMatch(/\bid="/);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // POLYMORPHIC TAG
  // ═══════════════════════════════════════════════════════════════

  describe('Polymorphic tags', () => {
    const tags = ['div', 'article', 'main', 'aside', 'header', 'footer'] as const;
    for (const tag of tags) {
      it(`should render as <${tag}>`, async () => {
        const html = await container.renderToString(Wrapper, { props: { tag } });
        expect(html).toContain(`<${tag}`);
      });
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // GRID CONFIGURATION
  // ═══════════════════════════════════════════════════════════════

  describe('Grid configuration', () => {
    it('should set grid-template-columns for grid display', async () => {
      const html = await container.renderToString(Wrapper, { props: { display: 'grid', cols: 3 } });
      expectHasClass(html, 'wrapper-grid');
      expectHasCSS(html, 'grid-template-columns', 'repeat(3, 1fr)');
    });

    it('should handle autoFit', async () => {
      const html = await container.renderToString(Wrapper, { props: { display: 'grid', autoFit: true } });
      expectHasCSS(html, 'grid-template-columns', 'repeat(auto-fit, minmax(250px, 1fr))');
    });

    it('should handle autoFill', async () => {
      const html = await container.renderToString(Wrapper, { props: { display: 'grid', autoFill: true } });
      expectHasCSS(html, 'grid-template-columns', 'repeat(auto-fill, minmax(250px, 1fr))');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // GAP PROP (NEW)
  // ═══════════════════════════════════════════════════════════════

  describe('Gap prop', () => {
    const tokens = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;
    for (const token of tokens) {
      it(`should apply gap style for token ${token}`, async () => {
        const html = await container.renderToString(Wrapper, { props: { gap: token } });
        expectHasCSS(html, 'gap');
      });
    }

    it('should not add gap style when not provided', async () => {
      const html = await container.renderToString(Wrapper, { props: {} });
      expect(html).not.toMatch(/\bgap:/);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // ALIGNMENT
  // ═══════════════════════════════════════════════════════════════

  describe('Alignment', () => {
    it('should apply justify-content from xAlign', async () => {
      const html = await container.renderToString(Wrapper, { props: { xAlign: 'center' } });
      expectHasCSS(html, 'justify-content', 'center');
    });

    it('should override both axes when align=center', async () => {
      const html = await container.renderToString(Wrapper, { props: { align: 'center' } });
      expectHasCSS(html, 'justify-content', 'center');
      expectHasCSS(html, 'align-items', 'center');
    });

    it('should apply alignItems from yAlign', async () => {
      const html = await container.renderToString(Wrapper, { props: { yAlign: 'bottom' } });
      expectHasCSS(html, 'align-items', 'flex-end');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // SPACING (INLINE STYLES)
  // ═══════════════════════════════════════════════════════════════

  describe('Spacing tokens', () => {
    it('should apply padding as inline style using tokens', async () => {
      const html = await container.renderToString(Wrapper, { props: { padding: 'lg' } });
      expectHasCSS(html, 'padding-block-start');
      expectHasCSS(html, 'padding-block-end');
    });

    it('should apply individual padding overrides', async () => {
      const html = await container.renderToString(Wrapper, { props: { paddingTop: 'xs', paddingBottom: 'xl' } });
      expectHasCSS(html, 'padding-block-start');
      expectHasCSS(html, 'padding-block-end');
    });

    it('should apply margin as inline style using tokens', async () => {
      const html = await container.renderToString(Wrapper, { props: { margin: 'sm' } });
      expectHasCSS(html, 'margin-block-start');
      expectHasCSS(html, 'margin-block-end');
    });

    it('should use aligned token names (xs instead of xsm, xxl instead of 2xl)', async () => {
      const html = await container.renderToString(Wrapper, { props: { padding: 'xs' } });
      expectHasCSS(html, 'padding-block-start');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // SIZE PROPS
  // ═══════════════════════════════════════════════════════════════

  describe('Size props', () => {
    it('should apply width', async () => {
      const html = await container.renderToString(Wrapper, { props: { width: '80%' } });
      expectHasCSS(html, 'width', '80%');
    });

    it('should apply height', async () => {
      const html = await container.renderToString(Wrapper, { props: { height: '500px' } });
      expectHasCSS(html, 'height', '500px');
    });

    it('should apply maxWidth', async () => {
      const html = await container.renderToString(Wrapper, { props: { maxWidth: '1200px' } });
      expectHasCSS(html, 'max-width', '1200px');
    });

    it('should apply minHeight', async () => {
      const html = await container.renderToString(Wrapper, { props: { minHeight: '400px' } });
      expectHasCSS(html, 'min-height', '400px');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // BORDER
  // ═══════════════════════════════════════════════════════════════

  describe('Border', () => {
    const borderTypes = ['border1', 'border2', 'border3'] as const;
    for (const bt of borderTypes) {
      it(`should apply border class for borderType=${bt}`, async () => {
        const html = await container.renderToString(Wrapper, { props: { border: true, borderType: bt } });
        expectHasClass(html, `wrapper-border-${bt}`);
        expectHasCSS(html, 'border');
      });
    }

    it('should not apply border when border=false', async () => {
      const html = await container.renderToString(Wrapper, { props: { border: false } });
      expect(html).not.toContain('wrapper-border-');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // BOX SHADOW
  // ═══════════════════════════════════════════════════════════════

  describe('Box shadow', () => {
    it('should apply known shadow class for sm', async () => {
      const html = await container.renderToString(Wrapper, { props: { boxShadow: 'sm' } });
      expectHasClass(html, 'wrapper-shadow-sm');
    });

    it('should apply known shadow class for lg', async () => {
      const html = await container.renderToString(Wrapper, { props: { boxShadow: 'lg' } });
      expectHasClass(html, 'wrapper-shadow-lg');
    });

    it('should not generate invalid class names when boxShadow is not provided', async () => {
      const html = await container.renderToString(Wrapper, { props: {} });
      expect(html).not.toMatch(/wrapper-shadow-var\(/);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // BACKGROUND VIDEO
  // ═══════════════════════════════════════════════════════════════

  describe('Background video', () => {
    it('should render video element when backgroundVideo is set', async () => {
      const html = await container.renderToString(Wrapper, { props: { backgroundVideo: '/videos/bg.mp4' } });
      expect(html).toContain('<video');
      expect(html).toContain('autoplay');
      expect(html).toContain('muted');
      expect(html).toContain('loop');
      expect(html).toContain('src="/videos/bg.mp4"');
      expect(html).toContain('wrapper-bg-video');
    });

    it('should not render video element when backgroundVideo is not set', async () => {
      const html = await container.renderToString(Wrapper, { props: {} });
      expect(html).not.toContain('<video');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // OVERLAY
  // ═══════════════════════════════════════════════════════════════

  describe('Overlay', () => {
    it('should render overlay when overlayColor is provided', async () => {
      const html = await container.renderToString(Wrapper, { props: { overlayColor: 'rgba(0,0,0,0.5)' } });
      expect(html).toContain('wrapper-overlay');
      expect(html).toContain('background-color:rgba(0,0,0,0.5)');
    });

    it('should not render overlay when overlayColor is not provided', async () => {
      const html = await container.renderToString(Wrapper, { props: {} });
      expect(html).not.toContain('wrapper-overlay');
    });

    it('should apply custom overlayOpacity', async () => {
      const html = await container.renderToString(Wrapper, { props: { overlayColor: '#000', overlayOpacity: 0.7 } });
      expect(html).toContain('opacity:0.7');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // INLINE STYLE PASSTHROUGH
  // ═══════════════════════════════════════════════════════════════

  describe('Inline style passthrough', () => {
    it('should append custom style to the style string', async () => {
      const html = await container.renderToString(Wrapper, { props: { style: 'opacity:0.8;filter:blur(2px)' } });
      expect(html).toContain('opacity:0.8');
      expect(html).toContain('filter:blur(2px)');
    });

    it('should not create invalid style entries from inlineStyle', async () => {
      const html = await container.renderToString(Wrapper, { props: { style: 'color:red' } });
      expect(html).not.toMatch(/color:red[^;]*:\s*$/);
      expect(html).toContain('color:red');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // ANIMATION
  // ═══════════════════════════════════════════════════════════════

  describe('Animation', () => {
    it('should apply animate class', async () => {
      const html = await container.renderToString(Wrapper, { props: { animate: 'fadeIn' } });
      expectHasClass(html, 'fadeIn');
    });

    it('should apply hover animation class', async () => {
      const html = await container.renderToString(Wrapper, { props: { hoverAnimate: 'scaleUp' } });
      expectHasClass(html, 'hover-scaleUp');
    });

    it('should apply transition duration/timing', async () => {
      const html = await container.renderToString(Wrapper, { props: { transitionDuration: '500ms', transitionTiming: 'linear' } });
      expectHasCSS(html, 'transition-duration', '500ms');
      expectHasCSS(html, 'transition-timing-function', 'linear');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // ACCESSIBILITY & STATE
  // ═══════════════════════════════════════════════════════════════

  describe('Accessibility and state', () => {
    it('should apply ariaLabel', async () => {
      const html = await container.renderToString(Wrapper, { props: { ariaLabel: 'Hero section' } });
      expect(html).toContain('aria-label="Hero section"');
    });

    it('should apply disabled state', async () => {
      const html = await container.renderToString(Wrapper, { props: { disabled: true } });
      expectHasClass(html, 'disabled');
    });

    it('should apply hidden state', async () => {
      const html = await container.renderToString(Wrapper, { props: { hidden: true } });
      expectHasClass(html, 'hidden');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // FLEX PROPS
  // ═══════════════════════════════════════════════════════════════

  describe('Flex configuration', () => {
    it('should apply flexDirection', async () => {
      const html = await container.renderToString(Wrapper, { props: { display: 'flex', flexDirection: 'column' } });
      expectHasClass(html, 'wrapper-flex');
    });

    it('should apply justifyItems', async () => {
      const html = await container.renderToString(Wrapper, { props: { justifyItems: 'center' } });
      expectHasCSS(html, 'justify-items', 'center');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // SECURITY
  // ═══════════════════════════════════════════════════════════════

  it('should prevent XSS in custom classes', async () => {
    const html = await container.renderToString(Wrapper, {
      props: { customClasses: '"><script>alert("xss")</script>' },
    });
    expectSecurity(html, { strict: true });
    expect(html).not.toContain('<script>');
  });

  // ═══════════════════════════════════════════════════════════════
  // DETERMINISM & STABILITY
  // ═══════════════════════════════════════════════════════════════

  it('should render deterministically', async () => {
    const props = { display: 'grid', cols: 3, variant: 'modern', color: 'primary' };
    const html1 = await container.renderToString(Wrapper, { props });
    const html2 = await container.renderToString(Wrapper, { props });
    const html3 = await container.renderToString(Wrapper, { props });
    expectDeterminism([html1, html2, html3], { strict: true });
    expectStability([html1, html2, html3], { strict: true });
    expect(html1).toBe(html2);
    expect(html2).toBe(html3);
  });

  // ═══════════════════════════════════════════════════════════════
  // SNAPSHOTS
  // ═══════════════════════════════════════════════════════════════

  it('snapshot: default render', async () => {
    const html = await container.renderToString(Wrapper);
    expectSnapshot(html);
  });

  it('snapshot: full grid with all props', async () => {
    const html = await container.renderToString(Wrapper, {
      props: {
        display: 'grid',
        cols: 3,
        gap: 'lg',
        variant: 'modern',
        color: 'accent',
        border: true,
        borderType: 'border2',
        padding: 'xl',
        margin: 'sm',
        id: 'test-wrapper',
      },
    });
    expectSnapshot(html);
  });
});
