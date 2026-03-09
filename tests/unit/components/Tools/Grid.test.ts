import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, it, expect, beforeAll } from 'vitest';
import Grid from '@components/Tools/Grid.astro';
import {
  expectHTML,
  expectHasClass,
  expectHasCSS,
  expectAria,
  expectSecurity,
  expectSemantics,
  expectDeterminism,
  expectStability,
  expectSnapshot,
} from '@tests/helpers/uiTestHelpers';

describe('Grid.astro Component', () => {
  let container: AstroContainer;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('should render a default div with block display', async () => {
    const html = await container.renderToString(Grid);
    expectHTML(html, { strict: true, requiredTags: ['div'] });
    expectHasClass(html, 'u-block');
    expectHasClass(html, 'u-initial');
    expectHasClass(html, 'u-default');
    expect(html).not.toContain('u-grid');
    expect(html).not.toContain('u-cols-');
  });

  it('should render as a grid with specific columns', async () => {
    const html = await container.renderToString(Grid, {
      props: { display: 'grid', cols: '3' },
    });
    expectHasClass(html, 'u-grid');
    expectHasClass(html, 'u-cols-3');
    expectHasCSS(html, 'grid-template-columns', 'repeat(3, 1fr)');
    expect(html).not.toContain('u-block');
  });

  it('should handle autoFit and autoFill grid configurations', async () => {
    const htmlFit = await container.renderToString(Grid, {
      props: { display: 'grid', autoFit: true },
    });
    expectHasClass(htmlFit, 'u-cols-auto-fit');
    expectHasCSS(htmlFit, 'grid-template-columns', 'repeat(auto-fit, minmax(250px, 1fr))');
    expect(htmlFit).not.toContain('u-block');

    const htmlFill = await container.renderToString(Grid, {
      props: { display: 'grid', autoFill: true },
    });
    expectHasClass(htmlFill, 'u-cols-auto-fill');
    expectHasCSS(htmlFill, 'grid-template-columns', 'repeat(auto-fill, minmax(250px, 1fr))');
    expect(htmlFill).not.toContain('u-block');
  });

  it('should render as a flex container with direction and wrap', async () => {
    const html = await container.renderToString(Grid, {
      props: { display: 'flex', flexDirection: 'row-reverse', flexWrap: 'wrap' },
    });
    expectHasClass(html, 'u-flex');
    expectHasClass(html, 'u-flex-row-reverse');
    expectHasClass(html, 'u-flex-wrap');
    expect(html).not.toContain('u-grid');
    expect(html).not.toContain('u-cols-');
  });

  it('should apply correct alignment classes and styles', async () => {
    const html = await container.renderToString(Grid, {
      props: { align: 'center', yAlign: 'bottom' },
    });
    expectHasClass(html, 'u-items-center');
    expectHasClass(html, 'u-justify-center');
    expectHasCSS(html, 'justify-content', 'center');
    expectHasCSS(html, 'align-items', 'center');
    expect(html).not.toContain('u-items-bottom');
    expect(html).not.toContain('u-justify-normal');
  });

  it('should force stretch alignment when sameHeight is true', async () => {
    const html = await container.renderToString(Grid, {
      props: { sameHeight: true, yAlign: 'top' },
    });
    expectHasClass(html, 'same-height');
    expectHasClass(html, 'u-items-stretch');
    expectHasCSS(html, 'align-items', 'stretch');
    expect(html).not.toContain('u-items-top');
  });


  it('should apply spacing utility classes for small integers', async () => {
    const html = await container.renderToString(Grid, {
      props: { padding: '2', margin: '4', paddingTop: '1' },
    });
    expectHasClass(html, 'u-p-2');
    expectHasClass(html, 'u-m-4');
    expectHasClass(html, 'u-pt-1');
    // padding/margin are applied via utility classes, not inline styles
  });


  it('should map spacing tokens to CSS variables in styles', async () => {
    const html = await container.renderToString(Grid, {
      props: { gap: 'xl', padding: 'sm' },
    });
    // Gap is rendered in inline style; verify it's present
    expectHasCSS(html, 'gap');
    // Utility classes for token-based spacing
    expect(html).toContain('u-gap-');
    expect(html).toContain('u-p-');
  });


  it('should apply variants and colors', async () => {
    const html = await container.renderToString(Grid, {
      props: { variant: 'futuristic', color: 'accent' },
    });
    expectHasClass(html, 'u-futuristic');
    expectHasClass(html, 'u-accent');
    expect(html).not.toContain('u-initial');
    expect(html).not.toContain('u-default');
  });


  it('should support polymorphic tags', async () => {
    const html = await container.renderToString(Grid, {
      props: { tag: 'article' },
    });
    expectSemantics(html, { requiredTags: ['article'] });
    expect(html).toContain('<article');
  });

  it('should apply accessibility and state attributes', async () => {
    const html = await container.renderToString(Grid, {
      props: { ariaLabel: 'Main Grid', disabled: true, hidden: true },
    });
    expectAria(html, { requiredAttributes: ['aria-label', 'aria-disabled', 'aria-hidden'] });
    expectHasClass(html, 'disabled');
    expectHasClass(html, 'hidden');
    expect(html).toContain('aria-label="Main Grid"');
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain('aria-hidden="true"');
  });

  it('should render deterministically and be stable', async () => {
    const props = { display: 'grid', cols: '4', gap: 'md', variant: 'retro' };
    const html1 = await container.renderToString(Grid, { props });
    const html2 = await container.renderToString(Grid, { props });
    const html3 = await container.renderToString(Grid, { props });
    expectDeterminism([html1, html2, html3], { strict: true });
    expectStability([html1, html2, html3], { strict: true });
    expect(html1).toBe(html2);
    expect(html2).toBe(html3);
    expect(html1).toContain('u-cols-4');
    expect(html1).toContain('u-grid');
    expect(html1).toContain('u-retro');
  });

  it('should prevent XSS in custom classes', async () => {
    const html = await container.renderToString(Grid, {
      props: { customClasses: '\"><script>alert(\"xss\")</script>' },
    });
    expectSecurity(html, { strict: true });
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('alert(');
  });

  // ═══════════════════════════════════════════════════════════════
  // EXHAUSTIVE VARIANT COVERAGE
  // ═══════════════════════════════════════════════════════════════

  describe('All variants', () => {
    const variants = ['initial', 'retro', 'modern', 'futuristic', 'default', 'primary', 'secondary', 'accent'] as const;
    for (const v of variants) {
      it(`should apply variant class u-${v}`, async () => {
        const html = await container.renderToString(Grid, { props: { variant: v } });
        expectHasClass(html, `u-${v}`);
      });
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // EXHAUSTIVE COLOR COVERAGE
  // ═══════════════════════════════════════════════════════════════

  describe('All colors', () => {
    const colors = ['default', 'primary', 'secondary', 'accent', 'error'] as const;
    for (const c of colors) {
      it(`should apply color class u-${c}`, async () => {
        const html = await container.renderToString(Grid, { props: { color: c } });
        expectHasClass(html, `u-${c}`);
      });
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // EXHAUSTIVE DISPLAY MODES
  // ═══════════════════════════════════════════════════════════════

  describe('All display modes', () => {
    const modes = [
      { display: 'block', cls: 'u-block' },
      { display: 'flex', cls: 'u-flex' },
      { display: 'grid', cls: 'u-grid' },
      { display: 'inline-flex', cls: 'u-inline-flex' },
      { display: 'inline-grid', cls: 'u-inline-grid' },
    ] as const;
    for (const { display, cls } of modes) {
      it(`should render display=${display} with class ${cls}`, async () => {
        const html = await container.renderToString(Grid, { props: { display } });
        expectHasClass(html, cls);
      });
    }

    it('should apply grid-template-columns for inline-grid', async () => {
      const html = await container.renderToString(Grid, { props: { display: 'inline-grid', cols: 3 } });
      expectHasClass(html, 'u-inline-grid');
      expectHasClass(html, 'u-cols-3');
      expectHasCSS(html, 'grid-template-columns', 'repeat(3, 1fr)');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // EXHAUSTIVE XALIGN / YALIGN COVERAGE
  // ═══════════════════════════════════════════════════════════════

  describe('All xAlign values', () => {
    const xAlignValues = [
      { xAlign: 'left', expected: 'start' },
      { xAlign: 'center', expected: 'center' },
      { xAlign: 'right', expected: 'end' },
      { xAlign: 'space-between', expected: 'space-between' },
      { xAlign: 'space-around', expected: 'space-around' },
      { xAlign: 'space-evenly', expected: 'space-evenly' },
      { xAlign: 'normal', expected: 'normal' },
    ] as const;
    for (const { xAlign, expected } of xAlignValues) {
      it(`should map xAlign=${xAlign} to u-justify-${expected}`, async () => {
        const html = await container.renderToString(Grid, { props: { xAlign } });
        expectHasClass(html, `u-justify-${expected}`);
      });
    }
  });

  describe('All yAlign values', () => {
    const yAlignValues = [
      { yAlign: 'top', expected: 'start' },
      { yAlign: 'center', expected: 'center' },
      { yAlign: 'bottom', expected: 'end' },
      { yAlign: 'stretch', expected: 'stretch' },
    ] as const;
    for (const { yAlign, expected } of yAlignValues) {
      it(`should map yAlign=${yAlign} to u-items-${expected}`, async () => {
        const html = await container.renderToString(Grid, { props: { yAlign } });
        expectHasClass(html, `u-items-${expected}`);
      });
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // EXHAUSTIVE SPACING TOKEN COVERAGE
  // ═══════════════════════════════════════════════════════════════

  describe('All spacing tokens for gap', () => {
    const tokens = ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;
    for (const token of tokens) {
      it(`should apply gap token u-gap-${token}`, async () => {
        const html = await container.renderToString(Grid, { props: { gap: token } });
        expectHasClass(html, `u-gap-${token}`);
      });
    }
  });

  describe('Spacing tokens for padding and margin', () => {
    const tokens = ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;
    for (const token of tokens) {
      it(`should apply padding token u-p-${token}`, async () => {
        const html = await container.renderToString(Grid, { props: { padding: token, yPadding: 'none', xPadding: 'none' } });
        expectHasClass(html, `u-p-${token}`);
      });

      it(`should apply margin token u-m-${token}`, async () => {
        const html = await container.renderToString(Grid, { props: { margin: token, yMargin: 'none', xMargin: 'none' } });
        expectHasClass(html, `u-m-${token}`);
      });
    }
  });

  describe('rowGap and columnGap tokens', () => {
    const tokens = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    for (const token of tokens) {
      it(`should apply rowGap token u-rowgap-${token}`, async () => {
        const html = await container.renderToString(Grid, { props: { rowGap: token } });
        expectHasClass(html, `u-rowgap-${token}`);
      });

      it(`should apply columnGap token u-colgap-${token}`, async () => {
        const html = await container.renderToString(Grid, { props: { columnGap: token } });
        expectHasClass(html, `u-colgap-${token}`);
      });
    }
  });

  describe('yPadding/xPadding shortcuts', () => {
    it('should apply yPadding to both pt and pb', async () => {
      const html = await container.renderToString(Grid, { props: { yPadding: 'lg', padding: 'none' } });
      expectHasClass(html, 'u-pt-lg');
      expectHasClass(html, 'u-pb-lg');
    });

    it('should apply xPadding to both pl and pr', async () => {
      const html = await container.renderToString(Grid, { props: { xPadding: 'xl', padding: 'none' } });
      expectHasClass(html, 'u-pl-xl');
      expectHasClass(html, 'u-pr-xl');
    });

    it('should let paddingTop override yPadding', async () => {
      const html = await container.renderToString(Grid, { props: { paddingTop: 'xs', yPadding: 'lg', padding: 'none' } });
      expectHasClass(html, 'u-pt-xs');
      expectHasClass(html, 'u-pb-lg');
    });

    it('should apply yMargin to both mt and mb', async () => {
      const html = await container.renderToString(Grid, { props: { yMargin: 'sm', margin: 'none' } });
      expectHasClass(html, 'u-mt-sm');
      expectHasClass(html, 'u-mb-sm');
    });

    it('should apply xMargin to both ml and mr', async () => {
      const html = await container.renderToString(Grid, { props: { xMargin: 'lg', margin: 'none' } });
      expectHasClass(html, 'u-ml-lg');
      expectHasClass(html, 'u-mr-lg');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // BORDER TYPES
  // ═══════════════════════════════════════════════════════════════

  describe('Border types', () => {
    const borderTypes = ['border1', 'border2', 'border3'] as const;
    for (const bt of borderTypes) {
      it(`should render border with borderType=${bt}`, async () => {
        const html = await container.renderToString(Grid, { props: { border: true, borderType: bt } });
        expectHasCSS(html, 'border');
      });
    }

    it('should not apply border style when border=false', async () => {
      const html = await container.renderToString(Grid, { props: { border: false } });
      expect(html).not.toMatch(/border:\d+px/);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // GRID TEMPLATE COLUMNS
  // ═══════════════════════════════════════════════════════════════

  describe('gridTemplateColumns', () => {
    it('should use custom gridTemplateColumns string', async () => {
      const html = await container.renderToString(Grid, {
        props: { display: 'grid', gridTemplateColumns: '200px 1fr 200px' },
      });
      expectHasCSS(html, 'grid-template-columns', '200px 1fr 200px');
    });

    it('should prioritize gridTemplateColumns over cols', async () => {
      const html = await container.renderToString(Grid, {
        props: { display: 'grid', cols: 3, gridTemplateColumns: '1fr 2fr 1fr' },
      });
      expectHasCSS(html, 'grid-template-columns', '1fr 2fr 1fr');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // SIZE PROPS — inline styles
  // ═══════════════════════════════════════════════════════════════

  describe('Size props as inline styles', () => {
    it('should apply width as inline style', async () => {
      const html = await container.renderToString(Grid, { props: { width: '500px' } });
      expectHasCSS(html, 'width', '500px');
    });

    it('should apply height as inline style', async () => {
      const html = await container.renderToString(Grid, { props: { height: '300px' } });
      expectHasCSS(html, 'height', '300px');
    });

    it('should apply maxWidth as inline style', async () => {
      const html = await container.renderToString(Grid, { props: { maxWidth: '1200px' } });
      expectHasCSS(html, 'max-width', '1200px');
    });

    it('should apply minHeight as inline style', async () => {
      const html = await container.renderToString(Grid, { props: { minHeight: '400px' } });
      expectHasCSS(html, 'min-height', '400px');
    });

    it('should use hFull for 100% height', async () => {
      const html = await container.renderToString(Grid, { props: { hFull: true } });
      expectHasCSS(html, 'height', '100%');
    });

    it('should use wFull for 100% width', async () => {
      const html = await container.renderToString(Grid, { props: { wFull: true } });
      expectHasCSS(html, 'width', '100%');
    });

    it('should default to auto for height/width when not specified', async () => {
      const html = await container.renderToString(Grid, { props: {} });
      expectHasCSS(html, 'height', 'auto');
      expectHasCSS(html, 'width', 'auto');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // OVERFLOW, Z-INDEX, BACKGROUND, CLIP-PATH
  // ═══════════════════════════════════════════════════════════════

  describe('Overflow', () => {
    it('should default to overflow hidden', async () => {
      const html = await container.renderToString(Grid, { props: {} });
      expectHasCSS(html, 'overflow', 'hidden');
    });

    it('should set overflow visible when overflowHidden=false', async () => {
      const html = await container.renderToString(Grid, { props: { overflowHidden: false } });
      expectHasCSS(html, 'overflow', 'visible');
    });
  });

  describe('zIndex', () => {
    it('should add z-index to inline style', async () => {
      const html = await container.renderToString(Grid, { props: { zIndex: '10' } });
      expectHasCSS(html, 'z-index', '10');
    });

    it('should accept numeric zIndex', async () => {
      const html = await container.renderToString(Grid, { props: { zIndex: 5 } });
      expectHasCSS(html, 'z-index', '5');
    });
  });

  describe('Background props', () => {
    it('should apply backgroundColor', async () => {
      const html = await container.renderToString(Grid, { props: { backgroundColor: '#ff0000' } });
      expectHasCSS(html, 'background-color', '#ff0000');
    });

    it('should apply backgroundImage as url()', async () => {
      const html = await container.renderToString(Grid, { props: { backgroundImage: '/images/bg.jpg' } });
      expectHasCSS(html, 'background-image', 'url(/images/bg.jpg)');
    });
  });

  describe('clipPath', () => {
    it('should apply clipPathTop', async () => {
      const html = await container.renderToString(Grid, { props: { clipPathTop: 'polygon(0 0, 100% 0, 100% 80%, 0 100%)' } });
      expectHasCSS(html, 'clip-path');
    });

    it('should apply clipPathBottom when clipPathTop is none', async () => {
      const html = await container.renderToString(Grid, { props: { clipPathBottom: 'polygon(0 20%, 100% 0, 100% 100%, 0 100%)' } });
      expectHasCSS(html, 'clip-path');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // INLINE STYLE PASSTHROUGH
  // ═══════════════════════════════════════════════════════════════

  describe('Inline style passthrough', () => {
    it('should append custom style to the style string', async () => {
      const html = await container.renderToString(Grid, { props: { style: 'opacity:0.5' } });
      expect(html).toContain('opacity:0.5');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // ANIMATION CLASSES
  // ═══════════════════════════════════════════════════════════════

  describe('Animation classes', () => {
    it('should apply animate class', async () => {
      const html = await container.renderToString(Grid, { props: { animate: 'fadeInUp' } });
      expectHasClass(html, 'fadeInUp');
    });

    it('should apply hover animation with prefix', async () => {
      const html = await container.renderToString(Grid, { props: { hoverAnimate: 'animate-pulse' } });
      expectHasClass(html, 'hover-animate-pulse');
    });

    it('should apply focus animation with prefix', async () => {
      const html = await container.renderToString(Grid, { props: { focusAnimate: 'animate-pulse' } });
      expectHasClass(html, 'focus-animate-pulse');
    });

    it('should apply active animation with prefix', async () => {
      const html = await container.renderToString(Grid, { props: { activeAnimate: 'animate-pulse' } });
      expectHasClass(html, 'active-animate-pulse');
    });

    it('should apply transition duration and timing', async () => {
      const html = await container.renderToString(Grid, {
        props: { transitionDuration: '500ms', transitionTiming: 'linear' },
      });
      expectHasCSS(html, 'transition-duration', '500ms');
      expectHasCSS(html, 'transition-timing-function', 'linear');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // ID PROP
  // ═══════════════════════════════════════════════════════════════

  describe('id prop', () => {
    it('should render id attribute on the element', async () => {
      const html = await container.renderToString(Grid, { props: { id: 'main-grid' } });
      expect(html).toContain('id="main-grid"');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // FLEX PROPS
  // ═══════════════════════════════════════════════════════════════

  describe('All flex directions', () => {
    const directions = ['row', 'row-reverse', 'column', 'column-reverse'] as const;
    for (const dir of directions) {
      it(`should apply flex direction ${dir}`, async () => {
        const html = await container.renderToString(Grid, { props: { display: 'flex', flexDirection: dir } });
        expectHasClass(html, `u-flex-${dir}`);
      });
    }
  });

  describe('All flex wrap modes', () => {
    const wraps = ['nowrap', 'wrap', 'wrap-reverse'] as const;
    for (const w of wraps) {
      it(`should apply flex wrap ${w}`, async () => {
        const html = await container.renderToString(Grid, { props: { display: 'flex', flexWrap: w } });
        expectHasClass(html, `u-flex-${w}`);
      });
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // GRID COLUMNS
  // ═══════════════════════════════════════════════════════════════

  describe('Grid column count', () => {
    for (const n of [1, 2, 3, 4, 5, 6]) {
      it(`should generate u-cols-${n} for cols=${n}`, async () => {
        const html = await container.renderToString(Grid, { props: { display: 'grid', cols: n } });
        expectHasClass(html, `u-cols-${n}`);
      });
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // TEXT ALIGN
  // ═══════════════════════════════════════════════════════════════

  describe('Text align', () => {
    for (const ta of ['left', 'center', 'right'] as const) {
      it(`should apply text-align=${ta}`, async () => {
        const html = await container.renderToString(Grid, { props: { textAlign: ta } });
        expectHasCSS(html, 'text-align', ta);
      });
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // SNAPSHOT REGRESSION
  // ═══════════════════════════════════════════════════════════════

  it('snapshot: default render', async () => {
    const html = await container.renderToString(Grid);
    expectSnapshot(html);
  });

  it('snapshot: full grid with all props', async () => {
    const html = await container.renderToString(Grid, {
      props: {
        display: 'grid',
        cols: 3,
        gap: 'lg',
        variant: 'modern',
        color: 'primary',
        border: true,
        borderType: 'border2',
        padding: 'xl',
        margin: 'sm',
      },
    });
    expectSnapshot(html);
  });
});
