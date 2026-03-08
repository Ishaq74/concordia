/**
 * Shared test infrastructure for component tests that use
 * AstroContainer, Playwright, Puppeteer, axe-core, and pa11y.
 *
 * Extracts the common beforeAll/afterAll setup from Alert.test.ts
 * and Button.test.ts to reduce duplication and enable file splitting.
 */

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { chromium, type Browser } from 'playwright';
import fs from 'fs';
import path from 'path';

export interface ComponentTestContext {
  container: AstroContainer;
  playwrightBrowser: Browser | null;
  reportsDir: string;
}

/**
 * Creates and returns a shared test context.
 * Call in `beforeAll`, cleanup with `destroyContext` in `afterAll`.
 */
export async function createComponentTestContext(
  testDir: string,
  options: { playwright?: boolean } = {}
): Promise<ComponentTestContext> {
  const container = await AstroContainer.create();

  let playwrightBrowser: Browser | null = null;
  if (options.playwright) {
    playwrightBrowser = await chromium.launch({ headless: true });
  }

  const reportsDir = path.join(testDir, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  return { container, playwrightBrowser, reportsDir };
}

/**
 * Cleanup shared resources.
 */
export async function destroyComponentTestContext(ctx: ComponentTestContext): Promise<void> {
  await ctx.playwrightBrowser?.close();
}

/**
 * Parse HTML string into a JSDOM document for assertions.
 */
export function parseHtml(html: string): Document {
  const { JSDOM } = require('jsdom');
  return new JSDOM(html).window.document;
}

/**
 * Run axe-core accessibility check on an HTML string.
 * Returns violations array.
 */
export async function runAxeOnHtml(html: string): Promise<any[]> {
  const axe = require('axe-core');
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM(html, { runScripts: 'dangerously' });

  // axe needs a document context
  const results = await axe.run(dom.window.document.body, {
    rules: { region: { enabled: false } },
  });
  return results.violations;
}
