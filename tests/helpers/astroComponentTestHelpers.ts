import { expect } from "vitest"
import { experimental_AstroContainer as AstroContainer } from "astro/container"
import { JSDOM } from "jsdom"
import axe from "axe-core"
import { chromium, type Page } from "playwright"

/* ============================================================
CORE RENDER
============================================================ */

export async function renderComponent(
  Component: any,
  props: Record<string, any> = {},
  slots: Record<string, any> = {}
): Promise<string> {
  const container = await AstroContainer.create()

  const html = await container.renderToString(Component, {
    props,
    slots
  })

  return html
}

/* ============================================================
HTML NORMALIZATION
============================================================ */

export function normalizeHtml(html: string): string {
  return html
    .replace(/\sdata-astro-[^=]+="[^"]*"/g, "")
    .replace(/\sdata-[^=]+="[^"]*"/g, "")
    .replace(/\sid="[^"]*"/g, "")
    .replace(/\sname="[^"]*"/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

/* ============================================================
DOM QUERY
============================================================ */

export function query(html: string, selector?: string): Element {
  const dom = new JSDOM(html)
  const doc = dom.window.document

  if (!selector) {
    const root = doc.body.firstElementChild
    if (!root) throw new Error("No root element found")
    return root
  }

  const el = doc.querySelector(selector)

  if (!el) {
    throw new Error(`Selector not found: ${selector}`)
  }

  return el
}

/* ============================================================
SNAPSHOT / HTML COMPARISON
============================================================ */

export function expectHtmlEqual(current: string, previous: string) {
  expect(normalizeHtml(current)).toBe(normalizeHtml(previous))
}

export function expectStable(htmls: string[]) {
  const normalized = htmls.map(normalizeHtml)

  for (let i = 1; i < normalized.length; i++) {
    expect(normalized[i]).toBe(normalized[i - 1])
  }
}

/* ============================================================
DOM ASSERTIONS
============================================================ */

export function expectHasClass(
  html: string,
  cls: string,
  selector?: string
) {
  const el = query(html, selector)

  const classes = el.getAttribute("class")?.split(/\s+/) || []

  expect(classes).toContain(cls)
}

export function expectAttribute(
  html: string,
  attr: string,
  value?: string,
  selector?: string
) {
  const el = query(html, selector)

  if (value === undefined) {
    expect(el.hasAttribute(attr)).toBe(true)
  } else {
    expect(el.getAttribute(attr)).toBe(value)
  }
}

export function expectStyle(
  html: string,
  property: string,
  value?: string,
  selector?: string
) {
  const el = query(html, selector)

  const style = el.getAttribute("style") || ""

  expect(style).toContain(property)

  if (value) {
    expect(style).toContain(`${property}:${value}`)
  }
}

export function expectText(
  html: string,
  text: string,
  selector?: string
) {
  const el = query(html, selector)

  expect(el.textContent?.trim()).toContain(text)
}

/* ============================================================
ACCESSIBILITY (AXE)
============================================================ */

export async function expectNoA11yViolations(html: string) {
  const { window } = new JSDOM(html)

  const results = await axe.run(window.document.body)

  if (results.violations.length > 0) {
    const report = results.violations
      .map(v => `${v.id}: ${v.description}`)
      .join("\n")

    throw new Error(`Accessibility violations:\n${report}`)
  }

  expect(results.violations.length).toBe(0)
}

/* ============================================================
PLAYWRIGHT HELPERS
============================================================ */

export async function withBrowser(
  fn: (page: Page) => Promise<void>
) {
  const browser = await chromium.launch()

  const page = await browser.newPage()

  try {
    await fn(page)
  } finally {
    await browser.close()
  }
}

export async function expectVisible(
  html: string,
  selector: string
) {
  await withBrowser(async page => {
    await page.setContent(html)

    const el = await page.$(selector)

    expect(el).not.toBeNull()

    const visible = await el?.isVisible()

    expect(visible).toBe(true)
  })
}

/* ============================================================
TEST MATRIX
============================================================ */

export async function runMatrix(
  cases: Record<string, any>,
  testFn: (name: string, props: any) => Promise<void>
) {
  for (const [name, props] of Object.entries(cases)) {
    await testFn(name, props)
  }
}

/* ============================================================
MULTI RENDER UTILITY
============================================================ */

export async function renderMultiple(
  Component: any,
  variants: Record<string, any>
) {
  const results: Record<string, string> = {}

  for (const [name, props] of Object.entries(variants)) {
    results[name] = await renderComponent(Component, props)
  }

  return results
}