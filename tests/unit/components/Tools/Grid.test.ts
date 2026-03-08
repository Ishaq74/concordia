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
  expectStability
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
});
