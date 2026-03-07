import { describe, it, expect } from "vitest"
import { experimental_AstroContainer as AstroContainer } from "astro/container"
import Avatar from "@components/ui/Avatar/Avatar.astro"

async function render(props = {}) {
  const container = await AstroContainer.create();
  return await container.renderToString(Avatar, { props });
}

describe("Avatar component contract", () => {
    it("HTML validity: always div.avatar", async () => {
      const html = await render();
      expect(html).toContain('<div');
      expect(html).toContain('class="avatar');
    });

    it("renders alt default if not provided", async () => {
      const html = await render({ src: "avatar.png" });
      expect(html).toContain('alt="Avatar"');
    });

    it("renders fallback initials for complex name", async () => {
      const html = await render({ fallback: "Jean-Pierre Dupont" });
      expect(html).toContain('JD');
    });

    it("renders fallback for unicode name", async () => {
      const html = await render({ fallback: "李 小龙" });
      expect(html).toContain('李小');
    });

    it("renders fallback for single word", async () => {
      const html = await render({ fallback: "Solo" });
      expect(html).toContain('S');
    });

    it("renders fallback for empty/undefined", async () => {
      const html = await render({ fallback: undefined });
      expect(html).toContain('?');
      const html2 = await render({ fallback: "" });
      expect(html2).toContain('?');
    });

    it("renders variant modern", async () => {
      const html = await render({ variant: "modern" });
      expect(html).toContain('modern');
      expect(html).toContain('class="avatar');
    });

    it("renders variant futuristic", async () => {
      const html = await render({ variant: "futuristic" });
      expect(html).toContain('futuristic');
      expect(html).toContain('class="avatar');
    });

    it("renders all sizes", async () => {
      for (const size of ["sm", "md", "lg", "xl"]) {
        const html = await render({ size });
        expect(html).toContain(`avatar-${size}`);
      }
    });

    it("renders all directions", async () => {
      for (const dir of ["row", "column"]) {
        const html = await render({ direction: dir });
        expect(html).toContain(`avatar-${dir}`);
      }
    });

    it("renders custom className", async () => {
      const html = await render({ className: "custom-class" });
      expect(html).toContain('custom-class');
      expect(html).toContain('class="avatar');
    });

    it("Immutability: same props same output", async () => {
      const before = await render({ src: "avatar.png", alt: "User" });
      const after = await render({ src: "avatar.png", alt: "User" });
      expect(before).toContain('<img');
      expect(after).toContain('<img');
      expect(before).toContain('src="avatar.png"');
      expect(after).toContain('src="avatar.png"');
      expect(before).toContain('alt="User"');
      expect(after).toContain('alt="User"');
    });

    it("Edge case: all props", async () => {
      const html = await render({ variant: "modern", src: "avatar.png", alt: "User", fallback: "Jane Doe", size: "lg", className: "extra", direction: "row" });
      expect(html).toContain('modern');
      expect(html).toContain('avatar-lg');
      expect(html).toContain('extra');
      expect(html).toContain('avatar-row');
      expect(html).toContain('<img');
      expect(html).toContain('src="avatar.png"');
      expect(html).toContain('alt="User"');
    });

    it("Performance: renders quickly", async () => {
      const start = Date.now();
      const html = await render({ src: "avatar.png" });
      const duration = Date.now() - start;
      expect(html).toContain('<img');
      expect(duration).toBeLessThan(100);
    });

    it("Production markup: minimal and valid", async () => {
      const html = await render({ src: "avatar.png" });
      expect(html).toContain('<div');
      expect(html).toContain('<img');
      expect(html).toContain('class="avatar');
      expect(html).toContain('src="avatar.png"');
      expect(html).toContain('alt="Avatar"');
    });

    it("Accessibility: alt always present", async () => {
      const html = await render({ src: "avatar.png" });
      expect(html).toContain('alt="Avatar"');
      const html2 = await render({ src: "avatar.png", alt: "User" });
      expect(html2).toContain('alt="User"');
    });
  it("HTML validity", async () => {
    const html = await render();
    expect(html).toContain('<div');
    expect(html).toContain('class="avatar');
  });

  it("renders with src and alt", async () => {
    const html = await render({ src: "avatar.png", alt: "User" });
    expect(html).toContain('<img');
    expect(html).toContain('src="avatar.png"');
    expect(html).toContain('alt="User"');
  });

  it("renders fallback initials", async () => {
    const html = await render({ fallback: "Jane Doe" });
    expect(html).toContain('JD');
    expect(html).toContain('class="avatar');
  });

  it("renders fallback ? if no name", async () => {
    const html = await render({ fallback: "" });
    expect(html).toContain('?');
    expect(html).toContain('class="avatar');
  });

  it("renders variant retro", async () => {
    const html = await render({ variant: "retro" });
    expect(html).toContain('retro');
    expect(html).toContain('class="avatar');
  });

  it("renders size xl", async () => {
    const html = await render({ size: "xl" });
    expect(html).toContain('avatar-xl');
    expect(html).toContain('class="avatar');
  });

  it("renders direction column", async () => {
    const html = await render({ direction: "column" });
    expect(html).toContain('avatar-column');
    expect(html).toContain('class="avatar');
  });

  it("renders custom className", async () => {
    const html = await render({ className: "custom-class" });
    expect(html).toContain('custom-class');
    expect(html).toContain('class="avatar');
  });

  it("Immutability", async () => {
    const before = await render({ src: "avatar.png", alt: "User" });
    const after = await render({ src: "avatar.png", alt: "User" });
    expect(before).toContain('<img');
    expect(after).toContain('<img');
    expect(before).toContain('src="avatar.png"');
    expect(after).toContain('src="avatar.png"');
    expect(before).toContain('alt="User"');
    expect(after).toContain('alt="User"');
  });

  it("Edge case: all props", async () => {
    const html = await render({ variant: "modern", src: "avatar.png", alt: "User", fallback: "Jane Doe", size: "lg", className: "extra", direction: "row" });
    expect(html).toContain('modern');
    expect(html).toContain('avatar-lg');
    expect(html).toContain('extra');
    expect(html).toContain('avatar-row');
    expect(html).toContain('<img');
    expect(html).toContain('src="avatar.png"');
    expect(html).toContain('alt="User"');
  });
});
