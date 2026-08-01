import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p", "b", "i", "u", "strong", "em", "a", "ul", "ol", "li",
  "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "img", "br", "hr",
  "table", "thead", "tbody", "tr", "th", "td", "code", "pre", "span",
  "div", "figure", "figcaption", "sub", "sup", "mark", "small",
];

const ALLOWED_ATTR = [
  "href", "src", "alt", "title", "class", "id", "target", "rel",
  "width", "height", "colspan", "rowspan", "loading",
];

const MAX_HTML_LENGTH = 500_000;
const SAFE_URL = /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i;

DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
    node.setAttribute("rel", "noopener noreferrer");
  }
});

export function sanitizeHtml(value: unknown): string {
  if (typeof value !== "string") return "";
  if (value.length > MAX_HTML_LENGTH) {
    throw new Error("HTML content exceeds the 500 KB limit");
  }
  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}

export function safeUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return SAFE_URL.test(trimmed) ? trimmed : "";
}

export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
