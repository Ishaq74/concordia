import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { ComponentProps } from 'astro/types';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import Button from '../../../src/components/ui/Button.astro';
import { axe } from 'vitest-axe';
import { JSDOM } from 'jsdom';

type LocalTestContext = {
  container: AstroContainer;
};

let container: AstroContainer;

describe('ui/Button', () => {
  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  beforeEach(() => {
    expect.assertions; // for safety
  });

  it('renders a <button> with its children by default', async () => {
    const props = {} satisfies ComponentProps<typeof Button>;
    const body = 'Click me';
    const result = await container.renderToString(Button, {
      props,
      slots: { default: body },
    });

    expect(result).toContain('<button');
    expect(result).toContain(body);
  });

  it('applies variant and color classes', async () => {
    const props = { variant: 'modern', color: 'primary' } satisfies ComponentProps<typeof Button>;
    const result = await container.renderToString(Button, {
      props,
      slots: { default: '🎯' },
    });
    expect(result).toMatch(/class="[^"]*modern[^"]*primary[^"]*"/);
  });

  it('forwards aria-label and disabled attribute', async () => {
    const props = { ariaLabel: 'accessible', disabled: true } satisfies ComponentProps<typeof Button>;
    const result = await container.renderToString(Button, { props, slots: { default: 'stuff' } });
    expect(result).toContain('aria-label="accessible"');
    expect(result).toContain('disabled');
  });

  it('renders an icon when provided', async () => {
    const props = { icon: { name: 'concordia', side: 'right' } } satisfies ComponentProps<typeof Button>;
    const result = await container.renderToString(Button, { props, slots: { default: 'ok' } });
    expect(result).toContain('<svg');
  });

  it('defaults type attribute to "button" and allows overriding', async () => {
    let result = await container.renderToString(Button, { props: {}, slots: { default: 'foo' } });
    expect(result).toContain('type="button"');

    result = await container.renderToString(Button, { props: { type: 'submit' }, slots: { default: 'foo' } });
    expect(result).toContain('type="submit"');
  });

  it('forwards arbitrary HTML attributes and custom className', async () => {
    const result = await container.renderToString(Button, {
      props: { 'data-test': 'xyz', id: 'my-button', className: 'extra' } as any,
      slots: { default: 'a' },
    });
    expect(result).toContain('data-test="xyz"');
    expect(result).toContain('id="my-button"');
    expect(result).toMatch(/class="(?:extra|\s)*"/);
  });

  it('does not render an <svg> when no icon prop is provided', async () => {
    const result = await container.renderToString(Button, { props: {}, slots: { default: 'noicon' } });
    expect(result).not.toContain('<svg');
  });

  it('renders the icon on the correct side', async () => {
    const right = await container.renderToString(Button, {
      props: { icon: { name: 'concordia', side: 'right' } },
      slots: { default: 'x' },
    });
    expect(right.indexOf('<svg')).toBeGreaterThan(right.indexOf('x'));

    const left = await container.renderToString(Button, {
      props: { icon: { name: 'concordia', side: 'left' } },
      slots: { default: 'x' },
    });
    expect(left.indexOf('<svg')).toBeLessThan(left.indexOf('x'));
  });

  it('omits default variant/color classes entirely', async () => {
    const res = await container.renderToString(Button, {
      props: { variant: 'initial', color: 'default' } as any,
      slots: { default: 'a' },
    });
    expect(res).toContain('class');
    expect(res).not.toMatch(/initial|default/);
  });

  it('accepts error color and appends it to classes', async () => {
    const res = await container.renderToString(Button, { props: { color: 'error' }, slots: { default: 'e' } });
    expect(res).toMatch(/class="[^\"]*error[^\"]*"/);
  });

  it('does not render disabled or aria-label when falsy/undefined', async () => {
    const res = await container.renderToString(Button, { props: { disabled: false } as any, slots: { default: 'z' } });
    expect(res).not.toContain('disabled');

    const res2 = await container.renderToString(Button, { props: {}, slots: { default: 'z' } });
    expect(res2).not.toContain('aria-label');
  });

  it('does nothing when icon side is missing or invalid', async () => {
    const res1 = await container.renderToString(Button, { props: { icon: { name: 'concordia' } } as any, slots: { default: 'i' } });
    expect(res1).not.toContain('<svg');

    const res2 = await container.renderToString(Button, { props: { icon: { name: 'concordia', side: 'middle' } } as any, slots: { default: 'i' } });
    expect(res2).not.toContain('<svg');
  });

  it('className is always appended after variant/color and wins over raw class attr', async () => {
    const res = await container.renderToString(Button, {
      props: { variant: 'modern', color: 'primary', className: 'my-extra', class: 'ignored' } as any,
      slots: { default: 'c' },
    });
    const match = res.match(/class="([^"]*)"/);
    expect(match).toBeTruthy();
    expect(match![1].endsWith('my-extra')).toBe(true);
  });

  it('explicit type prop is respected', async () => {
    const res = await container.renderToString(Button, { props: { type: 'reset' }, slots: { default: 't' } });
    expect(res).toContain('type="reset"');
  });

  it('renders well-formed markup and disabled appears only once', async () => {
    const res = await container.renderToString(Button, { props: { disabled: true }, slots: { default: '' } });
    expect(res.startsWith('<button')).toBe(true);
    expect(res).toContain('</button>');
    expect((res.match(/disabled/g) || []).length).toBe(1);
  });

  // ----------------------
  // Accessibility (axe)
  // ----------------------
  async function expectNoA11yViolations(html: string) {
    const { window } = new JSDOM(html);
    const results = await axe(window.document.body); // <- axe accepts HTMLElement
    expect(results.violations).toHaveLength(0);
  }

  it('has no accessibility violations with default content', async () => {
    const html = await container.renderToString(Button, { props: {}, slots: { default: 'Hello' } });
    await expectNoA11yViolations(html);
  });

  it('has no accessibility violations when icon is provided', async () => {
    const html = await container.renderToString(Button, {
      props: { icon: { name: 'concordia', side: 'left' } },
      slots: { default: 'Icon' },
    });
    await expectNoA11yViolations(html);
  });
});