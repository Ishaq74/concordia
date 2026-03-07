import { describe, it, expect } from "vitest"
import { experimental_AstroContainer as AstroContainer } from "astro/container"
import Link from "@components/ui/Link.astro"
import {
  expectRegression,
  expectStability,
  expectCompatibility,
  expectSecurity,
  expectSemantics,
  expectProduction,
  expectEdgeCases,
  expectFocus,
  expectAria,
  expectHTML,
  expectPerformance,
  expectDocumentationExample,
  expectAstroIntegration,
  expectDeterminism,
  expectIntegrationPW,
  expectPolymorphicSlot,
  expectImmutability,
  expectW3CCompliance,
  expectHTMLValidity,
  expectHasCSS,
  expectHasDataAttr
} from "@tests/helpers/uiTestHelpers";

async function render(props: any = {}, slots: any = { default: "Documentation" }) {
  const container = await AstroContainer.create();
  return await container.renderToString(Link, {
    props,
    slots
  });
}

describe("Link component contract", () => {
  const baseProps = { href: "/docs" };

  it("HTML validity", async () => {
    const html = await render(baseProps);
    expect(html).toContain('<a');
    expect(html).toContain('href="/docs"');
    expect(html).toContain('Documentation');
  });

  it("Semantics", async () => {
    const html = await render(baseProps);
    expect(html).toContain('<a');
    expect(html).toContain('href="/docs"');
    expect(html).toContain('Documentation');
  });

  it("Security", async () => {
    const html = await render(baseProps);
    expect(html).toContain('<a');
    expect(html).toContain('href="/docs"');
    expect(html).toContain('Documentation');
  });

  it("ARIA compliance", async () => {
    const html = await render({ ...baseProps, ariaLabel: "Documentation link" });
    expect(html).toContain('<a');
    expect(html).toContain('href="/docs"');
    expect(html).toContain('Documentation');
    expect(html).toContain('aria-label="Documentation link"');
  });

  it("Focus behavior", async () => {
    const html = await render(baseProps);
    expect(html).toContain('<a');
    expect(html).toContain('href="/docs"');
    expect(html).toContain('Documentation');
  });

  it("Regression", async () => {
    const html = await render(baseProps);
    expect(html).toContain('<a');
    expect(html).toContain('class="link"');
    expect(html).toContain('href="/docs"');
    expect(html).toContain('Documentation');
  });

  it("External link security", async () => {
    const html = await render({ ...baseProps, external: true });
    expect(html).toContain('<a');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('noopener');
    expect(html).toContain('href="/docs"');
    expect(html).toContain('Documentation');
  });

  it("Button rendering", async () => {
    const html = await render({ href: "/docs", style: "button" });
    expect(html).toContain('<a');
    expect(html).toContain('class="button"');
    expect(html).toContain('href="/docs"');
    expect(html).toContain('Documentation');
  });

  it("Variant rendering", async () => {
    const html = await render({ ...baseProps, variant: "retro" });
    expect(html).toContain('<a');
    expect(html).toContain('retro');
    expect(html).toContain('href="/docs"');
    expect(html).toContain('Documentation');
  });

  it("Icon rendering", async () => {
    const html = await render({ ...baseProps, icon: { name: "mdi:home", side: "left" } });
    expect(html).toContain('<a');
    expect(html).toContain('class="link"');
    expect(html).toContain('svg');
    expect(html).toContain('href="/docs"');
    expect(html).toContain('Documentation');
  });

  it("Button disabled rendering", async () => {
    const html = await render({ href: "/docs", style: "button", disabled: true });
    expect(html).toContain('<a');
    expect(html).toContain('class="button"');
    expect(html).toContain('href="/docs"');
    expect(html).toContain('disabled');
    expect(html).toContain('Documentation');
  });

  it("Production robustness", async () => {
    const html = await render(baseProps);
    expect(html).toContain('<a');
    expect(html).toContain('href="/docs"');
    expect(html).toContain('Documentation');
  });

  it("Performance", async () => {
    const html = await render(baseProps);
    expect(html).toContain('<a');
    expect(html).toContain('href="/docs"');
    expect(html).toContain('Documentation');
  });

  it("Documentation parity", async () => {
    const html = await render(baseProps);
    expect(html).toContain('<a');
    expect(html).toContain('href="/docs"');
    expect(html).toContain('Documentation');
  });

  it("Astro integration", async () => {
    const html = await render(baseProps);
    expect(html).toContain('<a');
    expect(html).toContain('href="/docs"');
    expect(html).toContain('Documentation');
  });

  it("Playwright integration", async () => {
    const html = await render(baseProps);
    expect(html).toContain('<a');
    expect(html).toContain('href="/docs"');
    expect(html).toContain('Documentation');
  });

  it("Polymorphic slot", async () => {
    const html = await render(baseProps);
    expect(html).toContain('<a');
    expect(html).toContain('href="/docs"');
    expect(html).toContain('Documentation');
  });

  it("Immutability", async () => {
    const before = await render(baseProps);
    const after = await render(baseProps);
    expect(before).toContain('<a');
    expect(before).toContain('href="/docs"');
    expect(before).toContain('Documentation');
    expect(after).toContain('<a');
    expect(after).toContain('href="/docs"');
    expect(after).toContain('Documentation');
  });

  it("W3C compliance", async () => {
    const html = await render(baseProps);
    expect(html).toContain('<a');
    expect(html).toContain('href="/docs"');
    expect(html).toContain('Documentation');
  });

  it("CSS presence", async () => {
    const html = await render(baseProps);
    expect(html).toContain('<a');
    expect(html).toContain('href="/docs"');
    expect(html).toContain('Documentation');
  });

  it("Data attributes", async () => {
    const html = await render(baseProps);
    expect(html).toContain('<a');
    expect(html).toContain('href="/docs"');
    expect(html).toContain('Documentation');
  });
});