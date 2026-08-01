import { describe, expect, it } from "vitest";
import { deleteStoredUpload, storeImageUpload, UploadError } from "@/lib/media/upload";
import { safeJsonLd, safeUrl, sanitizeHtml } from "@/lib/security/sanitize";

describe("HTML sanitization", () => {
  it("removes executable markup and protects external links", () => {
    const html = sanitizeHtml(
      '<p onclick="alert(1)">Safe</p><script>alert(1)</script><a target="_blank" href="https://example.com">Link</a>',
    );

    expect(html).not.toContain("onclick");
    expect(html).not.toContain("<script");
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("rejects unsafe URLs and safely serializes JSON-LD", () => {
    expect(safeUrl("javascript:alert(1)")).toBe("");
    expect(safeUrl("/safe/path")).toBe("/safe/path");
    expect(safeJsonLd({ value: "</script>" })).not.toContain("</script>");
  });
});

describe("media uploads", () => {
  it("rejects files whose bytes do not match their declared type", async () => {
    const file = new File(["not a png"], "fake.png", { type: "image/png" });

    await expect(storeImageUpload(file, "blog")).rejects.toMatchObject({
      code: "invalid_content",
    } satisfies Partial<UploadError>);
  });

  it("refuses to delete URLs outside the managed upload directory", async () => {
    await expect(deleteStoredUpload("/uploads/blog/../../package.json", "blog")).resolves.toBe(false);
    await expect(deleteStoredUpload("/uploads/services/file.png", "blog")).resolves.toBe(false);
  });
});
