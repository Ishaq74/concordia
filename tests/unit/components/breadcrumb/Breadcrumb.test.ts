import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import Breadcrumb from "@components/ui/Breadcrumb/Breadcrumb.astro";
import {
  expectHTML,
  expectSemantics,
  expectEdgeCases,
  expectImmutability,
  expectProduction
} from "@tests/helpers/uiTestHelpers";

async function render(props = {}, slots = { default: '<ol><li>Home</li><li>Docs</li></ol>' }) {
  const container = await AstroContainer.create();
  return await container.renderToString(Breadcrumb, { props, slots });
}

describe("Breadcrumb component contract", () => {
    it("renders variant retro", async () => {
      const html = await render({ variant: "retro" });
      expect(html).toContain('retro');
      expect(html).toEqual(expect.stringMatching(/<nav/i));
    });

    it("renders variant modern", async () => {
      const html = await render({ variant: "modern" });
      expect(html).toContain('modern');
      expect(html).toEqual(expect.stringMatching(/<nav/i));
    });

    it("renders variant futuristic", async () => {
      const html = await render({ variant: "futuristic" });
      expect(html).toContain('futuristic');
      expect(html).toEqual(expect.stringMatching(/<nav/i));
    });

    it("renders color accent", async () => {
      const html = await render({ color: "accent" });
      expect(html).toContain('accent');
      expect(html).toEqual(expect.stringMatching(/<nav/i));
    });

    it("renders custom className", async () => {
      const html = await render({ className: "custom-class" });
      expect(html).toContain('custom-class');
      expect(html).toEqual(expect.stringMatching(/<nav/i));
    });

    it("Immutability", async () => {
      const before = await render({ color: "primary" });
      const after = await render({ color: "primary" });
      expect(before).toEqual(expect.stringMatching(/<nav/i));
      expect(after).toEqual(expect.stringMatching(/<nav/i));
      expect(before).toBe(after);
    });

    it("Edge case: empty slot", async () => {
      const html = await render({}, { default: "" });
      expect(html).toEqual(expect.stringMatching(/<nav/i));
    });

    it("Accessibility: aria-label present", async () => {
      const html = await render();
      expect(html).toContain('aria-label="Breadcrumb"');
      expect(html).toEqual(expect.stringMatching(/<nav/i));
    });
  it("HTML validity", async () => {
    const html = await render();
    expect(html).toEqual(expect.stringMatching(/<nav/i));
  });

  it("Semantics", async () => {
    const html = await render();
    expectSemantics(html, { selector: "nav", requiredTags: ["nav", "ol", "li"] });
  });

  it("Edge cases: variant/color/className", async () => {
    const html = await render({ variant: "retro", color: "accent", className: "custom" });
    expectEdgeCases(html, { selector: "nav", cases: [
      { description: "variant", pattern: "retro", shouldMatch: true },
      { description: "color", pattern: "accent", shouldMatch: true },
      { description: "custom class", pattern: "custom", shouldMatch: true }
    ] });
  });

  it("Immutability", async () => {
    const before = await render({ color: "primary" });
    const after = await render({ color: "primary" });
    expectImmutability(before, after, { selector: "nav" });
  });

  it("Production robustness", async () => {
    const html = await render({ color: "primary" });
    expectProduction(html, { selector: "nav", env: "production" });
  });

  it("Edge case: empty slot", async () => {
    const html = await render({}, { default: "" });
    expect(html).toEqual(expect.stringMatching(/<nav/i));
  });
});
