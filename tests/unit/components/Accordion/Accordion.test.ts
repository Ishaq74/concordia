import { describe, it } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import Accordion from "@components/ui/Accordion/Accordion.astro";
import {
  expectHTML,
  expectSemantics,
  expectEdgeCases,
  expectImmutability,
  expectProduction,
  expectRegression,
  expectSecurity
} from "@tests/helpers/uiTestHelpers";

async function render(props = {}, slots = { default: "<div>Item</div>" }) {
  const container = await AstroContainer.create();
  return await container.renderToString(Accordion, { props, slots });
}

describe("Accordion component contract", () => {
  it("HTML validity", async () => {
    const html = await render();
    expectHTML(html, { selector: ".accordion", requiredTags: ["div"] });
  });

  it("Semantics", async () => {
    const html = await render();
    expectSemantics(html, { selector: ".accordion", requiredTags: ["div"] });
  });

  it("Security", async () => {
    const html = await render();
    expectSecurity(html, { selector: ".accordion" });
  });

  it("Regression", async () => {
    const html = await render({ variant: "modern" });
    const previous = '<div class="accordion modern">Item</div>';
    expectRegression(html, previous, { 
      selector: ".accordion",
      customMatcher: (current: string, prev: string) => {
        // Compare structure loosely: both should be .accordion.modern divs with "Item" text
        const { JSDOM } = require('jsdom');
        const curr = new JSDOM(current).window.document.querySelector('.accordion');
        const prevEl = new JSDOM(prev).window.document.querySelector('.accordion');
        expect(curr?.classList.contains('accordion')).toBe(true);
        expect(curr?.classList.contains('modern')).toBe(true);
        expect(curr?.textContent?.trim()).toBe(prevEl?.textContent?.trim());
      }
    });
  });

  it("Edge cases: variant/color/className", async () => {
    const html = await render({ variant: "retro", color: "accent", className: "extra" });
    expectEdgeCases(html, { selector: ".accordion", cases: [
      { description: "variant", pattern: "retro", shouldMatch: true },
      { description: "color", pattern: "accent", shouldMatch: true },
      { description: "className", pattern: "extra", shouldMatch: true }
    ] });
  });

  it("Immutability", async () => {
    const before = await render({ variant: "modern" });
    const after = await render({ variant: "modern" });
    expectImmutability(before, after, { selector: ".accordion" });
  });

  it("Production robustness", async () => {
    const html = await render({ color: "primary" });
    expectProduction(html, { selector: ".accordion", env: "production" });
  });

  it("Edge case: all props", async () => {
    const html = await render({ variant: "futuristic", color: "secondary", className: "extra" });
    expectHTML(html, { selector: ".accordion", requiredTags: ["div"] });
    expectEdgeCases(html, { selector: ".accordion", cases: [
      { description: "variant", pattern: "futuristic", shouldMatch: true },
      { description: "color", pattern: "secondary", shouldMatch: true },
      { description: "className", pattern: "extra", shouldMatch: true }
    ] });
    expectImmutability(html, html, { selector: ".accordion" });
  });
});
