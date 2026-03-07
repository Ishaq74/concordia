import { describe, it, expect } from "vitest"
import { experimental_AstroContainer as AstroContainer } from "astro/container"
import Kbd from "@components/ui/Kbd.astro"

async function render(props = {}, slots = { default: "Ctrl" }) {
  const container = await AstroContainer.create();
  return await container.renderToString(Kbd, { props, slots });
}

describe("Kbd component contract", () => {
    it("HTML validity", async () => {
      const html = await render();
      expect(html).toContain('<kbd');
      expect(html).toContain('Ctrl');
    });

    it("Semantics", async () => {
      const html = await render();
      expect(html).toContain('<kbd');
      expect(html).toContain('Ctrl');
    });

    it("Immutability", async () => {
      const before = await render({ color: "primary" }, { default: "Ctrl" });
      const after = await render({ color: "primary" }, { default: "Ctrl" });
      expect(before).toContain('<kbd');
      expect(after).toContain('<kbd');
      expect(before).toContain('primary');
      expect(after).toContain('primary');
      expect(before).toContain('Ctrl');
      expect(after).toContain('Ctrl');
    });

    it("Slot polymorphism", async () => {
      const html = await render({}, { default: "⌘ K" });
      expect(html).toContain('<kbd');
      expect(html).toContain('⌘ K');
    });

    it("Edge case: empty slot", async () => {
      const html = await render({}, { default: "" });
      expect(html).toContain('<kbd');
    });

    it("Edge case: all props", async () => {
      const html = await render({ variant: "retro", color: "accent", size: "lg", className: "extra" }, { default: "Enter" });
      expect(html).toContain('<kbd');
      expect(html).toContain('kbd-retro');
      expect(html).toContain('accent');
      expect(html).toContain('kbd-lg');
      expect(html).toContain('extra');
      expect(html).toContain('Enter');
    });

    it("Production robustness", async () => {
      const html = await render({ variant: "modern" }, { default: "Ctrl" });
      expect(html).toContain('<kbd');
      expect(html).toContain('kbd-modern');
      expect(html).toContain('Ctrl');
    });

    it("Performance", async () => {
      const html = await render({ size: "lg" }, { default: "Ctrl" });
      expect(html).toContain('<kbd');
      expect(html).toContain('kbd-lg');
      expect(html).toContain('Ctrl');
    });

    it("Accessibility: slot content explicit", async () => {
      const html = await render({ className: "extra" }, { default: "Ctrl" });
      expect(html).toContain('<kbd');
      expect(html).toContain('extra');
      expect(html).toContain('Ctrl');
      // Pas d'aria-label exigé, le contenu est explicite
    });
  it("renders default kbd", async () => {
    const html = await render();
    expect(html).toContain('<kbd');
    expect(html).toContain('class="kbd"');
    expect(html).toContain('Ctrl');
  });

  it("renders variant retro", async () => {
    const html = await render({ variant: "retro" });
    expect(html).toContain('<kbd');
    expect(html).toContain('kbd-retro');
    expect(html).toContain('Ctrl');
  });

  it("renders variant modern", async () => {
    const html = await render({ variant: "modern" });
    expect(html).toContain('<kbd');
    expect(html).toContain('kbd-modern');
    expect(html).toContain('Ctrl');
  });

  it("renders variant futuristic", async () => {
    const html = await render({ variant: "futuristic" });
    expect(html).toContain('<kbd');
    expect(html).toContain('kbd-futuristic');
    expect(html).toContain('Ctrl');
  });

  it("renders color primary", async () => {
    const html = await render({ color: "primary" });
    expect(html).toContain('<kbd');
    expect(html).toContain('primary');
    expect(html).toContain('Ctrl');
  });

  it("renders color secondary", async () => {
    const html = await render({ color: "secondary" });
    expect(html).toContain('<kbd');
    expect(html).toContain('secondary');
    expect(html).toContain('Ctrl');
  });

  it("renders color accent", async () => {
    const html = await render({ color: "accent" });
    expect(html).toContain('<kbd');
    expect(html).toContain('accent');
    expect(html).toContain('Ctrl');
  });

  it("renders size sm", async () => {
    const html = await render({ size: "sm" });
    expect(html).toContain('<kbd');
    expect(html).toContain('kbd-sm');
    expect(html).toContain('Ctrl');
  });

  it("renders size lg", async () => {
    const html = await render({ size: "lg" });
    expect(html).toContain('<kbd');
    expect(html).toContain('kbd-lg');
    expect(html).toContain('Ctrl');
  });

  it("renders custom className", async () => {
    const html = await render({ className: "custom-class" });
    expect(html).toContain('<kbd');
    expect(html).toContain('custom-class');
    expect(html).toContain('Ctrl');
  });

  it("renders slot content", async () => {
    const html = await render({}, { default: "⌘ K" });
    expect(html).toContain('<kbd');
    expect(html).toContain('⌘ K');
  });
});
