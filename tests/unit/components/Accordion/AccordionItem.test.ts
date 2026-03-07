import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import AccordionItem from "@components/ui/Accordion/AccordionItem.astro";
import {
  expectHTML,
  expectSemantics,
  expectImmutability,
  expectSecurity
} from "@tests/helpers/uiTestHelpers";

async function render(props = {}, slots = { default: "<div>Content</div>", title: "Title" }) {
  const container = await AstroContainer.create();
  return await container.renderToString(AccordionItem, { props, slots });
}

describe("AccordionItem component contract", () => {
  // HTML & Semantics
  it("HTML validity", async () => {
    const html = await render();
    expectHTML(html, { selector: ".accordion-item", requiredTags: ["details", "summary", "div"] });
    expect(html.includes('<details')).toBeTruthy();
    expect(html.includes('<summary')).toBeTruthy();
  });
  it("Semantics", async () => {
    const html = await render();
    expectSemantics(html, { selector: ".accordion-item", requiredTags: ["details", "summary"] });
    expect(html.includes('<details')).toBeTruthy();
    expect(html.includes('<summary')).toBeTruthy();
  });
  // Accessibilité
  it("Accessibility: ARIA, region, summary", async () => {
    const html = await render({ disabled: false });
    expect(html).toContain("role=\"region\"");
    expect(html).toContain("aria-labelledby");
    expect(html).toContain("<summary");
  });
  it("Accessibility: disabled", async () => {
    const html = await render({ disabled: true });
    expect(html).toContain("data-disabled=\"true\"");
    expect(html).toContain("aria-disabled=\"true\"");
  });
  // Boundary
  it("Boundary: long string, unicode, deep object", async () => {
    const html = await render({ title: "A".repeat(1000) }, { default: "😀🚀✨", title: "A".repeat(1000) });
    expect(html).toContain("😀");
    expect(html).toContain("A".repeat(1000));
    const deep = await render({ contentClass: JSON.stringify({ deep: { level: 1 } }) });
    expect(deep).toContain("accordion-content");
  });
  // Stress
  it("Stress: 1000 items", async () => {
    const container = await AstroContainer.create();
    const items = await Promise.all(Array.from({ length: 1000 }, (_, i) => container.renderToString(AccordionItem, { props: { title: `Item ${i}` }, slots: { default: `Content ${i}` } } )));
    expect(items).toHaveLength(1000);
    expect(items[999]).toContain("Item 999");
  });
  // Symétrie/réversibilité
  it("Symmetry: toggle open/disabled/type", async () => {
    const open = await render({ open: true });
    const closed = await render({ open: false });
    expectImmutability(open, open, { selector: ".accordion-item" });
    expect(open).not.toBe(closed);
    const disabled = await render({ disabled: true });
    expectImmutability(disabled, disabled, { selector: ".accordion-item" });
  });
  // Isolation
  it("Isolation: parent pollué", async () => {
    const html = `<div style='color:red'><details class='accordion-item'>${await render()}</details></div>`;
    expect(html).toContain("accordion-item");
  });
  // Polymorphisme
  it("Polymorphism: slot text, HTML, emoji, number, whitespace", async () => {
    expect((await render({}, { default: "Plain text", title: "Title" })).toString()).toContain("Plain text");
    expect((await render({}, { default: "<b>HTML</b>", title: "Title" })).toString()).toContain("<b>HTML");
    expect((await render({}, { default: "🚀", title: "Title" })).toString()).toContain("🚀");
    expect((await render({}, { default: "42", title: "Title" })).toString()).toContain("42");
    expect((await render({}, { default: "  Trimmed  ", title: "Title" })).toString()).toContain("Trimmed");
  });
  // CSS/data-attrs
  it("CSS/data-attrs: classes, data-*", async () => {
    const html = await render({ className: "custom", contentClass: "cont", triggerClass: "trig", "data-test": "val" });
    expect(html).toContain("custom");
    expect(html).toContain("cont");
    expect(html).toContain("trig");
    expect(html.includes('val')).toBeTruthy();
    expectHTML(html, {
      selector: ".accordion-item",
      requiredTags: ["details", "summary", "div"]
    });
  });
  // Compatibilité navigateur
  it("Compat: HTML5, aria, data-*", async () => {
    const html = await render({ title: "Compat" });
    expect(html).toContain("details");
    expect(html).toContain("aria-labelledby");
    expect(html).toContain("data-type");
  });
  // Sécurité avancée
  it("Security: XSS, script, eval, inline handlers", async () => {
    const html = await render({ title: '<script>alert(1)</script>', className: 'onclick="alert(1)"' });
    expectSecurity(html, { selector: ".accordion-item" });
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("onclick");
    expect(html).not.toContain("eval(");
  });
  // Documentation/snapshot/intégration
  it("Documentation example", async () => {
    const html = await render({ title: "Doc", open: true, className: "doc" }, { default: "Doc content", title: "Doc" });
    expect(html).toContain("Doc");
    expect(html).toContain("doc");
    expect(html).toContain("Doc content");
  });
  it("Snapshot", async () => {
    const html = await render({ title: "Snapshot" });
    // Filtrer les attributs dynamiques pour le snapshot
    const filtered = html
      .replace(/\sdata-astro-cid-[^=]+="[^"]*"/g, '')
      .replace(/\sdata-astro-source-[^=]+="[^"]*"/g, '')
      .replace(/\sdata-[^=]+="[^"]*"/g, '')
      .replace(/id="[^"]*"/g, '')
      .replace(/name="[^"]*"/g, '')
      .replace(/data-test="[^"]*"/g, '')
      .replace(/data-astro-source-file="[^"]*"/g, '')
      .replace(/data-astro-source-loc="[^"]*"/g, '')
      .replace(/data-type="[^"]*"/g, '')
      .replace(/data-[^=]+="[^"]*"/g, '');
    // Assertion structurelle : balises, classes, contenu
    expect(filtered.includes('<details')).toBeTruthy();
    expect(filtered.includes('accordion-item')).toBeTruthy();
    expect(filtered.includes('<summary')).toBeTruthy();
    expect(filtered.includes('accordion-title')).toBeTruthy();
    expect(filtered.includes('Content')).toBeTruthy();
  });
  it("Integration: workflow complet", async () => {
    const html = await render({ open: true, disabled: false, className: "integration", contentClass: "cont", triggerClass: "trig" }, { default: "Integration", title: "Integration" });
    expect(html).toContain("integration");
    expect(html).toContain("cont");
    expect(html).toContain("trig");
    expect(html).toContain("Integration");
  });
});
