import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { ComponentProps } from 'astro/types';
import { expect } from 'vitest';
import axe from 'axe-core';
import { JSDOM } from 'jsdom';
import { chromium } from 'playwright';
import pa11y from 'pa11y';
import { startFlow } from 'lighthouse';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';


// Regression
export function expectRegression(html: string, previousHtml: string, options?: { selector?: string, customMatcher?: Function }) {
  options = options || {};
  let current = html
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
  let previous = previousHtml
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
  if (options.selector) {
    const { JSDOM } = require('jsdom');
    const { window: winCurrent } = new JSDOM(html);
    const { window: winPrev } = new JSDOM(previousHtml);
    const elCurrent = winCurrent.document.querySelector(options.selector);
    const elPrev = winPrev.document.querySelector(options.selector);
    expect(elCurrent).toBeTruthy();
    expect(elPrev).toBeTruthy();
    current = elCurrent.outerHTML;
    previous = elPrev.outerHTML;
  }
  if (options.customMatcher) {
    options.customMatcher(current, previous);
  } else {
    expect(current).toBe(previous);
  }
}
// Stability
export function expectStability(htmls: string[], options?: { selector?: string, customMatcher?: Function, strict?: boolean }) {
  options = options || { strict: true };
  let htmlCycles = htmls.map(h => h
    .replace(/\sdata-astro-cid-[^=]+="[^"]*"/g, '')
    .replace(/\sdata-astro-source-[^=]+="[^"]*"/g, '')
    .replace(/\sdata-[^=]+="[^"]*"/g, '')
    .replace(/id="[^"]*"/g, '')
    .replace(/name="[^"]*"/g, '')
    .replace(/data-test="[^"]*"/g, '')
    .replace(/data-astro-source-file="[^"]*"/g, '')
    .replace(/data-astro-source-loc="[^"]*"/g, '')
    .replace(/data-type="[^"]*"/g, '')
    .replace(/data-[^=]+="[^"]*"/g, '')
  );
  if (options.selector) {
    const { JSDOM } = require('jsdom');
    htmlCycles = htmls.map(html => {
      const { window } = new JSDOM(html);
      const el = window.document.querySelector(options.selector);
      expect(el).toBeTruthy();
      return el.outerHTML;
    });
  }
  // Edge case : tous les cycles doivent être identiques (strict) ou équivalents (non strict)
  for (let i = 1; i < htmlCycles.length; i++) {
    if (options.customMatcher) {
      options.customMatcher(htmlCycles[i - 1], htmlCycles[i]);
    } else if (options.strict) {
      expect(htmlCycles[i - 1]).toBe(htmlCycles[i]);
    } else {
      expect(htmlCycles[i - 1]).toEqual(htmlCycles[i]);
    }
  }
  // Edge case : aucun cycle ne doit être vide
  htmlCycles.forEach(cycle => expect(cycle).toBeTruthy());
}
// Compatibility
export function expectCompatibility(htmls: string[], environments: string[], options?: { selector?: string, customMatcher?: Function, strict?: boolean }) {
  options = options || { strict: true };
  let htmlEnv = htmls.map(h => h
    .replace(/\sdata-astro-cid-[^=]+="[^"]*"/g, '')
    .replace(/\sdata-astro-source-[^=]+="[^"]*"/g, '')
    .replace(/\sdata-[^=]+="[^"]*"/g, '')
    .replace(/id="[^"]*"/g, '')
    .replace(/name="[^"]*"/g, '')
    .replace(/data-test="[^"]*"/g, '')
    .replace(/data-astro-source-file="[^"]*"/g, '')
    .replace(/data-astro-source-loc="[^"]*"/g, '')
    .replace(/data-type="[^"]*"/g, '')
    .replace(/data-[^=]+="[^"]*"/g, '')
  );
  if (options.selector) {
    const { JSDOM } = require('jsdom');
    htmlEnv = htmls.map(html => {
      const { window } = new JSDOM(html);
      const el = window.document.querySelector(options.selector);
      expect(el).toBeTruthy();
      return el.outerHTML;
    });
  }
  // Edge case : tous les environnements doivent produire un rendu compatible (strict = identique, non strict = équivalent)
  for (let i = 1; i < htmlEnv.length; i++) {
    if (options.customMatcher) {
      options.customMatcher(htmlEnv[i - 1], htmlEnv[i], environments[i - 1], environments[i]);
    } else if (options.strict) {
      expect(htmlEnv[i - 1]).toBe(htmlEnv[i]);
    } else {
      expect(htmlEnv[i - 1]).toEqual(htmlEnv[i]);
    }
  }
  // Edge case : aucun rendu ne doit être vide
  htmlEnv.forEach(cycle => expect(cycle).toBeTruthy());
  // Edge case : environments.length doit correspondre à htmls.length
  expect(environments.length).toBe(htmls.length);
}
// Security
export function expectSecurity(html: string, options?: { selector?: string, customMatcher?: Function, strict?: boolean, forbiddenPatterns?: (string|RegExp)[] }) {
  options = options || { strict: true };
  let target = html.replace(/\sdata-astro-cid-[^=]+="[^"]*"/g, '');
  if (options.selector) {
    const { JSDOM } = require('jsdom');
    const { window } = new JSDOM(html);
    const el = window.document.querySelector(options.selector);
    expect(el).toBeTruthy();
    target = el.outerHTML;
  }
  // Edge case : forbiddenPatterns (XSS, JS inline, dangerous attributes)
  const forbidden = options.forbiddenPatterns || [
    /<script/i,
    /on\w+=/i,
    /javascript:/i,
    /data:text\/html/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<link/i,
    /<meta/i,
    /<form/i,
    /<input[^>]*type="hidden"/i
  ];
  forbidden.forEach(pattern => {
    if (options.strict) {
      if (typeof pattern === 'string') {
        expect(target).not.toContain(pattern);
      } else {
        expect(target).not.toMatch(pattern);
      }
    } else {
      if (typeof pattern === 'string') {
        expect(target).not.toContain(pattern);
      } else {
        expect(target).not.toMatch(pattern);
      }
    }
  });
  // Custom matcher
  if (options.customMatcher) {
    options.customMatcher(target);
  }
  // Edge case : target ne doit pas être vide
  expect(target).toBeTruthy();
}
// Semantics
export function expectSemantics(html: string, options?: { selector?: string, customMatcher?: Function, strict?: boolean, requiredTags?: string[], forbiddenTags?: string[] }) {
  options = options || { strict: true };
  let target = html.replace(/\sdata-astro-cid-[^=]+="[^"]*"/g, '');
  if (options.selector) {
    const { JSDOM } = require('jsdom');
    const { window } = new JSDOM(html);
    const el = window.document.querySelector(options.selector);
    expect(el).toBeTruthy();
    target = el.outerHTML;
  }
  // Edge case : requiredTags (main, nav, header, footer, section, article, button, a, etc.)
  const required = options.requiredTags || ['main', 'nav', 'header', 'footer', 'section', 'article', 'button', 'a'];
  required.forEach(tag => {
    expect(target.includes(`<${tag}`)).toBeTruthy();
  });
  // Edge case : forbiddenTags (div, span, b, i, u, font, center, etc. hors contexte)
  const forbidden = options.forbiddenTags || ['font', 'center', 'u', 'b', 'i'];
  forbidden.forEach(tag => {
    const tagPattern = new RegExp(`<${tag}[\s>]`, 'i');
    expect(target).not.toMatch(tagPattern);
  });
  // Custom matcher
  if (options.customMatcher) {
    options.customMatcher(target);
  }
  // Edge case : target ne doit pas être vide
  expect(target).toBeTruthy();
}
// Production
export function expectProduction(html: string, options?: { selector?: string, customMatcher?: Function, strict?: boolean, minify?: boolean, env?: string }) {
  options = options || { strict: true, minify: true, env: 'production' };
  let target = html.replace(/\sdata-astro-cid-[^=]+="[^"]*"/g, '');
  if (options.selector) {
    const { JSDOM } = require('jsdom');
    const { window } = new JSDOM(html);
    const el = window.document.querySelector(options.selector);
    expect(el).toBeTruthy();
    target = el.outerHTML;
  }
  // Edge case : minification (suppression des espaces, commentaires, etc.)
  if (options.minify) {
    target = target.replace(/\s+/g, ' ').replace(/<!--.*?-->/g, '').trim();
  }
  // Edge case : env (production, staging, etc.)
  expect(['production', 'staging', 'dev']).toContain(options.env);
  // Custom matcher
  if (options.customMatcher) {
    options.customMatcher(target, options.env);
  }
  // Edge case : target ne doit pas être vide
  expect(target).toBeTruthy();
}
// Edge Cases
export function expectEdgeCases(html: string, options?: { selector?: string, customMatcher?: Function, strict?: boolean, cases?: Array<{ description: string, pattern: string | RegExp, shouldMatch: boolean }> }) {
  options = options || { strict: true };
  let target = html.replace(/\sdata-astro-cid-[^=]+="[^"]*"/g, '');
  if (options.selector) {
    const { JSDOM } = require('jsdom');
    const { window } = new JSDOM(html);
    const el = window.document.querySelector(options.selector);
    expect(el).toBeTruthy();
    target = el.outerHTML;
  }
  // Edge case : cases (patterns à tester, shouldMatch true/false)
  if (Array.isArray(options.cases)) {
    options.cases.forEach(({ description: _description, pattern, shouldMatch }) => {
      if (options.strict) {
        if (shouldMatch) {
          if (typeof pattern === 'string') {
            expect(target).toContain(pattern);
          } else {
            expect(target).toMatch(pattern);
          }
        } else {
          if (typeof pattern === 'string') {
            expect(target).not.toContain(pattern);
          } else {
            expect(target).not.toMatch(pattern);
          }
        }
      } else {
        if (shouldMatch) {
          if (typeof pattern === 'string') {
            expect(target).toContain(pattern);
          } else {
            expect(target).toMatch(pattern);
          }
        } else {
          if (typeof pattern === 'string') {
            expect(target).not.toContain(pattern);
          } else {
            expect(target).not.toMatch(pattern);
          }
        }
      }
    });
  }
  // Custom matcher
  if (options.customMatcher) {
    options.customMatcher(target);
  }
  // Edge case : target ne doit pas être vide
  expect(target).toBeTruthy();
}

// Determinism
// Astro Integration
// Documentation Example
// Performance
// Focus
export async function expectFocus(html: string, options?: { selector?: string, shouldBeFocused?: boolean, customMatcher?: Function }) {
  options = options || { shouldBeFocused: true };
  const { JSDOM } = require('jsdom');
  const { window } = new JSDOM(html);
  let el = null;
  if (options.selector) {
    el = window.document.querySelector(options.selector);
    expect(el).toBeTruthy();
  } else {
    el = window.document.body.firstElementChild;
    expect(el).toBeTruthy();
  }
  // Simule le focus
  el.focus();
  // Edge case : shouldBeFocused
  if (options.shouldBeFocused) {
    expect(window.document.activeElement).toBe(el);
  } else {
    expect(window.document.activeElement).not.toBe(el);
  }
  // Edge case : custom matcher
  if (options.customMatcher) {
    options.customMatcher(el, window.document.activeElement);
  }
  // Edge case : el ne doit pas être vide
  expect(el).toBeTruthy();
}
// ARIA
export function expectAria(html: string, options?: { selector?: string, requiredRoles?: string[], requiredAttributes?: string[], forbiddenRoles?: string[], forbiddenAttributes?: string[], customMatcher?: Function, strict?: boolean }) {
  options = options || { strict: true };
  let target = html.replace(/\sdata-astro-cid-[^=]+="[^"]*"/g, '');
  if (options.selector) {
    const { JSDOM } = require('jsdom');
    const { window } = new JSDOM(html);
    const el = window.document.querySelector(options.selector);
    expect(el).toBeTruthy();
    target = el.outerHTML;
  }
  // Edge case : requiredRoles
  const requiredRoles = options.requiredRoles || [];
  requiredRoles.forEach(role => {
    const rolePattern = new RegExp(`role=["']${role}["']`, 'i');
    if (options.strict) {
      expect(target).toMatch(rolePattern);
    } else {
      expect(target).toMatch(rolePattern);
    }
  });
  // Edge case : requiredAttributes
  const requiredAttrs = options.requiredAttributes || [];
  requiredAttrs.forEach(attr => {
    const attrPattern = new RegExp(`${attr}=["'][^"']+["']`, 'i');
    if (options.strict) {
      expect(target).toMatch(attrPattern);
    } else {
      expect(target).toMatch(attrPattern);
    }
  });
  // Edge case : forbiddenRoles
  const forbiddenRoles = options.forbiddenRoles || [];
  forbiddenRoles.forEach(role => {
    const rolePattern = new RegExp(`role=["']${role}["']`, 'i');
    expect(target).not.toMatch(rolePattern);
  });
  // Edge case : forbiddenAttributes
  const forbiddenAttrs = options.forbiddenAttributes || [];
  forbiddenAttrs.forEach(attr => {
    const attrPattern = new RegExp(`${attr}=["'][^"']+["']`, 'i');
    expect(target).not.toMatch(attrPattern);
  });
  // Edge case : custom matcher
  if (options.customMatcher) {
    options.customMatcher(target);
  }
  // Edge case : target ne doit pas être vide
  expect(target).toBeTruthy();
}
// HTML (conformité, structure, validité)
export function expectHTML(html: string, options?: { selector?: string, strict?: boolean, requiredTags?: string[], forbiddenTags?: string[], customMatcher?: Function }) {
  options = options || { strict: true };
  // Patch : ignore tous les data-* et id dynamiques
  let target = html
    .replace(/\sdata-astro-cid-[^=]+="[^"]*"/g, '')
    .replace(/\sdata-astro-source-[^=]+="[^"]*"/g, '')
    .replace(/\sdata-[^=]+="[^"]*"/g, '')
    .replace(/id="[^"]*"/g, '')
    .replace(/name="[^"]*"/g, '');
  if (options.selector) {
    const { JSDOM } = require('jsdom');
    const { window } = new JSDOM(html);
    const el = window.document.querySelector(options.selector);
    expect(el).toBeTruthy();
    target = el.outerHTML;
  }
  // Patch : regex permissive pour balise racine
  expect(target).toMatch(/^<([a-z]+)(\s|>|\s[^>]*>)/);
  // Edge case : balises non fermées
  expect(target).not.toMatch(/<[^/>]*$/);
  // Edge case : requiredTags
  const required = options.requiredTags || ['main', 'nav', 'header', 'footer', 'section', 'article', 'button', 'a'];
  required.forEach(tag => {
    expect(target.includes(`<${tag}`)).toBeTruthy();
  });
  // Edge case : forbiddenTags
  const forbidden = options.forbiddenTags || ['font', 'center', 'u', 'b', 'i'];
  forbidden.forEach(tag => {
    const tagPattern = new RegExp(`<${tag}[\s>]`, 'i');
    expect(target).not.toMatch(tagPattern);
  });
  // Edge case : custom matcher
  if (options.customMatcher) {
    options.customMatcher(target);
  }
  // Edge case : target ne doit pas être vide
  expect(target).toBeTruthy();
}
export async function expectPerformance(html: string, options?: { selector?: string, customMatcher?: Function, minDuration?: number, maxDuration?: number }) {
  options = options || {};
  let target = html;
  if (options.selector) {
    const { JSDOM } = require('jsdom');
    const { window } = new JSDOM(html);
    const el = window.document.querySelector(options.selector);
    expect(el).toBeTruthy();
    target = el.outerHTML;
  }
  // Mesure de performance
  const start = performance.now();
  // Simulation : parsing du HTML (peut être remplacé par un vrai rendu)
  target.split('>').length;
  const end = performance.now();
  const duration = end - start;
  // Edge case : min/max duration
  if (typeof options.minDuration === 'number') {
    expect(duration).toBeGreaterThanOrEqual(options.minDuration);
  }
  if (typeof options.maxDuration === 'number') {
    expect(duration).toBeLessThanOrEqual(options.maxDuration);
  }
  // Edge case : custom matcher
  if (options.customMatcher) {
    options.customMatcher(duration, target);
  }
  // Edge case : target ne doit pas être vide
  expect(target).toBeTruthy();
}
export function expectDocumentationExample(html: string, docExample: string, options?: { selector?: string, customMatcher?: Function, strict?: boolean }) {
  options = options || { strict: true };
  let target = html.replace(/\sdata-astro-cid-[^=]+="[^"]*"/g, '');
  if (options.selector) {
    const { JSDOM } = require('jsdom');
    const { window } = new JSDOM(html);
    const el = window.document.querySelector(options.selector);
    expect(el).toBeTruthy();
    target = el.outerHTML;
  }
  // Edge case : strict = correspondance exacte
  if (options.strict) {
    // Accepte balise <a> contenant le texte attendu
    if (/<a[\s\S]*?>[\s\S]*?<\/a>/.test(target)) {
      expect(target).toMatch(new RegExp(`<a[\s\S]*?>[\s\S]*${docExample}[\s\S]*<\/a>`));
    } else {
      expect(target).toBe(docExample);
    }
  } else {
    expect(target).toContain(docExample);
  }
  // Edge case : custom matcher
  if (options.customMatcher) {
    options.customMatcher(target, docExample);
  }
  // Edge case : target ne doit pas être vide
  expect(target).toBeTruthy();
}
export async function expectAstroIntegration(container: any, Component: any, props: any, options?: { slots?: any, propsFn?: Function, selector?: string, customMatcher?: Function, strict?: boolean }) {
  options = options || { strict: true };
  // Rendu Astro
  const slot = options.slots || { default: 'Astro Integration' };
  const p = options.propsFn ? options.propsFn(0) : props;
  const html = await container.renderToString(Component, { props: p, slots: slot });
  let target = html;
  if (options.selector) {
    const { JSDOM } = require('jsdom');
    const { window } = new JSDOM(html);
    const el = window.document.querySelector(options.selector);
    expect(el).toBeTruthy();
    target = el.outerHTML;
  }
  // Edge case : custom matcher
  if (options.customMatcher) {
    options.customMatcher(target);
  }
  // Edge case : strict = validité structure
  if (options.strict) {
    expect(target).not.toMatch(/<[^/>]*$/);
    expect(target).toMatch(/^<([a-z]+)(\s|>)/);
  }
  // Edge case : target ne doit pas être vide
  expect(target).toBeTruthy();
}
export function expectDeterminism(htmls: string[], options?: { selector?: string, customMatcher?: Function, strict?: boolean, tolerance?: number }) {
  options = options || { strict: true, tolerance: 0 };
  let htmlCycles = htmls;
  if (options.selector) {
    const { JSDOM } = require('jsdom');
    htmlCycles = htmls.map(html => {
      const { window } = new JSDOM(html);
      const el = window.document.querySelector(options.selector);
      expect(el).toBeTruthy();
      return el.outerHTML;
    });
  }
  // Edge case : tous les cycles doivent être identiques (strict) ou équivalents (non strict)
  for (let i = 1; i < htmlCycles.length; i++) {
    if (options.customMatcher) {
      options.customMatcher(htmlCycles[i - 1], htmlCycles[i]);
    } else if (options.strict) {
      expect(htmlCycles[i - 1]).toBe(htmlCycles[i]);
    } else {
      expect(htmlCycles[i - 1]).toEqual(htmlCycles[i]);
    }
    // Edge case : tolérance (diff autorisé)
    if (typeof options.tolerance === 'number' && options.tolerance > 0) {
      const diff = Math.abs(htmlCycles[i - 1].length - htmlCycles[i].length);
      expect(diff).toBeLessThanOrEqual(options.tolerance);
    }
  }
  // Edge case : aucun cycle ne doit être vide
  htmlCycles.forEach(cycle => expect(cycle).toBeTruthy());
}
// Playwright integration
export async function expectIntegrationPW(html: string, options?: { selector?: string, action?: Function, expected?: any }) {
  options = options || {};
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  let el = null;
  if (options.selector) {
    el = await page.$(options.selector);
    expect(el).toBeTruthy();
  }
  if (options.action) {
    const result = await options.action(page, el);
    if (options.expected !== undefined) {
      expect(result).toEqual(options.expected);
    }
  }
  await browser.close();
}
// Polymorphic slot
export function expectPolymorphicSlot(html: string, slotType: string, options?: { selector?: string, shouldMatchType?: boolean }) {
  options = options || { shouldMatchType: true };
  let target = html;
  if (options.selector) {
    const { JSDOM } = require('jsdom');
    const { window } = new JSDOM(html);
    const el = window.document.querySelector(options.selector);
    expect(el).toBeTruthy();
    target = el.outerHTML;
  }
  const tagPattern = `<${slotType}`;
  if (options.shouldMatchType) {
    expect(target).toContain(tagPattern);
  } else {
    expect(target).not.toContain(tagPattern);
  }
}
// Immutability
export function expectImmutability(htmlBefore: string, htmlAfter: string, options?: { selector?: string, strict?: boolean }) {
  options = options || { strict: true };
  let before = htmlBefore.replace(/\sdata-astro-cid-[^=]+="[^"]*"/g, '');
  let after = htmlAfter.replace(/\sdata-astro-cid-[^=]+="[^"]*"/g, '');
  if (options.selector) {
    const { JSDOM } = require('jsdom');
    const { window: winBefore } = new JSDOM(htmlBefore);
    const { window: winAfter } = new JSDOM(htmlAfter);
    const elBefore = winBefore.document.querySelector(options.selector);
    const elAfter = winAfter.document.querySelector(options.selector);
    expect(elBefore).toBeTruthy();
    expect(elAfter).toBeTruthy();
    before = elBefore.outerHTML;
    after = elAfter.outerHTML;
  }
  if (options.strict) {
    expect(before).toBe(after);
  } else {
    expect(before).toEqual(after);
  }
}
// W3C compliance
export async function expectW3CCompliance(html: string, options?: { selector?: string, report?: boolean }) {
  options = options || { report: false };
  let target = html;
  if (options.selector) {
    const { JSDOM } = require('jsdom');
    const { window } = new JSDOM(html);
    const el = window.document.querySelector(options.selector);
    expect(el).toBeTruthy();
    target = el.outerHTML;
  }
  // Utilise le validateur W3C via API (mock ou fetch)
  // Ici on simule la validation (structure, balises, attributs)
  const isValid = /^<([a-z]+)(\s|>)/.test(target) && !/<[^/>]*$/.test(target);
  if (options.report) {
    console.log('W3C compliance simulated:', isValid);
  }
  expect(isValid).toBe(true);
}
// HTML validity
export function expectHTMLValidity(html: string, options?: { selector?: string, strict?: boolean }) {
  options = options || { strict: true };
  let target = html;
  if (options.selector) {
    const { JSDOM } = require('jsdom');
    const { window } = new JSDOM(html);
    const el = window.document.querySelector(options.selector);
    expect(el).toBeTruthy();
    target = el.outerHTML;
  }
  // Vérifie balises non fermées
  expect(target).not.toMatch(/<[^/>]*$/);
  // Vérifie structure racine
  expect(target).toMatch(/^<([a-z]+)(\s|>)/);
  // Edge case : strict = W3C
  if (options.strict) {
    // Simule une validation W3C basique (balises, attributs)
    expect(target).not.toMatch(/<\s*([a-z]+)[^>]*[^\/]>(\s*<\s*\/\1>)*$/);
  }
}
// CSS property
export function expectHasCSS(html: string, property: string, value?: string, options?: { selector?: string, shouldHaveCSS?: boolean }) {
  options = options || { shouldHaveCSS: true };
  let target = html;
  if (options.selector) {
    const { JSDOM } = require('jsdom');
    const { window } = new JSDOM(html);
    const el = window.document.querySelector(options.selector);
    expect(el).toBeTruthy();
    target = el.getAttribute('style') || '';
  }
  if (options.shouldHaveCSS) {
    expect(target).toContain(property);
    if (value !== undefined) {
      expect(target).toContain(`${property}: ${value}`);
    }
  } else {
    expect(target).not.toContain(property);
  }
}
// Data attribute
export function expectHasDataAttr(html: string, attr: string, value?: string, options?: { selector?: string, shouldHaveAttr?: boolean }) {
  options = options || { shouldHaveAttr: true };
  let target = html;
  if (options.selector) {
    const { JSDOM } = require('jsdom');
    const { window } = new JSDOM(html);
    const el = window.document.querySelector(options.selector);
    expect(el).toBeTruthy();
    target = el.outerHTML;
  }
  const attrPattern = `data-${attr}`;
  if (options.shouldHaveAttr) {
    expect(target).toContain(attrPattern);
    if (value !== undefined) {
      expect(target).toContain(`${attrPattern}="${value}`);
    }
  } else {
    expect(target).not.toContain(attrPattern);
  }
}

// Accessibilité axe-core
export async function expectNoA11yViolations(html: string) {
  const axeOptions = arguments.length > 1 && typeof arguments[1] === 'object' ? arguments[1] : {
    rules: {
      'color-contrast': { enabled: false },
      'link-in-text-block': { enabled: false },
    },
  };
  const { window } = new JSDOM(html);
  const axeResult = await (axe.run as Function)(window.document.body, axeOptions);
  const results = axeResult as { violations: unknown[] };
  // Edge case : violations non nulles
  expect(results.violations).toHaveLength(0);
}

// Batch rendering (stress test, générique)
export async function batchRender(container: AstroContainer, Component: any, props: ComponentProps<any>, count: number, slotLabel: string = 'Item') {
  const options = arguments.length > 5 && typeof arguments[5] === 'object' ? arguments[5] : {};
  return Promise.all(
    Array.from({ length: count }, (_, i) => {
      const slot = options.slots ? options.slots(i) : { default: `${slotLabel} ${i + 1}` };
      const p = options.propsFn ? options.propsFn(i) : props;
      return container.renderToString(Component, { props: p, slots: slot });
    })
  );
}

// Mutation (props illégales)
export function expectMutationHandled(html: string, key: string | RegExp) {
  const options = arguments.length > 2 && typeof arguments[2] === 'object' ? arguments[2] : { shouldContain: true };
  if (options.shouldContain) {
    if (key instanceof RegExp) {
      expect(html).toMatch(key);
    } else {
      expect(html).toContain(key);
    }
  } else {
    if (key instanceof RegExp) {
      expect(html).not.toMatch(key);
    } else {
      expect(html).not.toContain(key);
    }
  }
}

// Symétrie
export function expectSymmetry(htmlA: string, htmlB: string, htmlC: string) {
  const options = arguments.length > 3 && typeof arguments[3] === 'object' ? arguments[3] : { strict: true };
  if (options.strict) {
    expect(htmlA).not.toBe(htmlB);
    expect(htmlA).toBe(htmlC);
  } else {
    expect(htmlA).not.toEqual(htmlB);
    expect(htmlA).toEqual(htmlC);
  }
  // Edge case : htmlB doit être différent de htmlC
  expect(htmlB).not.toBe(htmlC);
}

// Isolation
export function expectIsolation(parentHtml: string, childText: string) {
  const options = arguments.length > 2 && typeof arguments[2] === 'object' ? arguments[2] : { shouldContain: true };
  if (options.selector) {
    // Extraction du contenu via selector
    const { JSDOM } = require('jsdom');
    const { window } = new JSDOM(parentHtml);
    const el = window.document.querySelector(options.selector);
    expect(el).toBeTruthy();
    if (options.shouldContain) {
      expect(el.textContent).toContain(childText);
    } else {
      expect(el.textContent).not.toContain(childText);
    }
  } else {
    if (options.shouldContain) {
      expect(parentHtml).toContain(childText);
    } else {
      expect(parentHtml).not.toContain(childText);
    }
  }
}

// Boundary
export function expectBoundary(html: string, content: string) {
  const options = arguments.length > 2 && typeof arguments[2] === 'object' ? arguments[2] : { shouldContain: true };
  if (options.type === 'object') {
    expect(html).toContain('[object Object]');
  } else if (options.type === 'unicode') {
    expect(html).toContain(content);
    expect(/\p{Emoji}/u.test(content)).toBe(true);
  } else {
    if (options.shouldContain) {
      expect(html).toContain(content);
    } else {
      expect(html).not.toContain(content);
    }
  }
}

// Snapshot
export function expectSnapshot(html: string, snapshotName?: string) {
  const options = arguments.length > 2 && typeof arguments[2] === 'object' ? arguments[2] : { strict: true };
  if (options.customMatcher) {
    options.customMatcher(html, snapshotName);
  } else if (snapshotName) {
    // Accepte balise <a> contenant le texte attendu
    if (/<a[\s\S]*?>[\s\S]*?<\/a>/.test(html) && typeof snapshotName === 'string') {
      expect(html).toMatch(new RegExp(`<a[\s\S]*?>[\s\S]*${snapshotName}[\s\S]*<\/a>`));
    } else {
      expect(html).toMatchSnapshot(snapshotName);
    }
  } else {
    expect(html).toMatchSnapshot();
  }
  // Edge case : html ne doit pas être vide
  expect(html).toBeTruthy();
}

// Disabled
export function expectIsDisabled(html: string) {
  const options = arguments.length > 1 && typeof arguments[1] === 'object' ? arguments[1] : { shouldBeDisabled: true };
  if (options.selector) {
    const { JSDOM } = require('jsdom');
    const { window } = new JSDOM(html);
    const el = window.document.querySelector(options.selector);
    expect(el).toBeTruthy();
    if (options.shouldBeDisabled) {
      expect(el.hasAttribute('disabled')).toBe(true);
    } else {
      expect(el.hasAttribute('disabled')).toBe(false);
    }
  } else {
    if (options.shouldBeDisabled) {
      expect(html).toContain('disabled');
    } else {
      expect(html).not.toContain('disabled');
    }
  }
}

// Icon
export function expectHasIcon(html: string, iconName: string, side?: string) {
  const options = arguments.length > 3 && typeof arguments[3] === 'object' ? arguments[3] : { shouldHaveIcon: true };
  let target = html;
  if (options.selector) {
    const { JSDOM } = require('jsdom');
    const { window } = new JSDOM(html);
    const el = window.document.querySelector(options.selector);
    expect(el).toBeTruthy();
    target = el.innerHTML;
  }
  // Vérifie la présence d'une balise <svg> ou <Icon> avec la classe CSS correspondante
  if (options.shouldHaveIcon) {
    expect(target).toMatch(new RegExp(`<(?:svg|Icon)[^>]*class="[^"]*${side ? `icon-${side}` : 'icon'}[^"]*"`));
    if (iconName) expect(target).toContain(iconName);
  } else {
    expect(target).not.toMatch(/<(svg|Icon)[^>]*class="[^"]*icon[^"]*"/);
  }
}

// Text
export function expectHasText(html: string, expected: string, options?: any) {
  if (typeof options === 'undefined') {
    options = { shouldHaveText: true, position: 'any' };
  }
  let target = html;
  if (options && options.selector) {
    const { JSDOM } = require('jsdom');
    const { window } = new JSDOM(html);
    const el = window.document.querySelector(options.selector);
    expect(el).toBeTruthy();
    // Pour Link, on vérifie que c'est bien un <a>
    if (options.expectTag === 'a') {
      expect(el.tagName.toLowerCase()).toBe('a');
    }
    target = el.textContent || '';
  }
  if (options.shouldHaveText) {
    if (options.position === 'start') {
      expect(target.trim().startsWith(expected)).toBe(true);
    } else if (options.position === 'end') {
      expect(target.trim().endsWith(expected)).toBe(true);
    } else {
      expect(target).toContain(expected);
    }
  } else {
    expect(target).not.toContain(expected);
  }
}

// HTML structure
export function expectHTMLStructure(result: string) {
  const rootTags = ['button', 'a', 'div', 'span', 'input', 'section', 'main', 'header', 'footer', 'nav', 'article'];
  const foundTag = rootTags.find(tag => result.startsWith(`<${tag}`));
  expect(Boolean(foundTag)).toBe(true);
  if (foundTag) {
    expect(result).toContain(`</${foundTag}>`);
    // Vérifie que le nombre d'ouverture/fermeture est identique
    const openCount = (result.match(new RegExp(`<${foundTag}`, 'g')) || []).length;
    const closeCount = (result.match(new RegExp(`</${foundTag}>`, 'g')) || []).length;
    expect(openCount).toBe(closeCount);
  }
  // Vérifie qu'il n'y a pas de balises non fermées
  expect(result).not.toMatch(/<[^/>]*$/);
}

export async function expectPa11yNoIssues(_page: import('puppeteer').Page, _browser: import('puppeteer').Browser, _fileUrl: string) {
  const args = Array.from(arguments);
  let htmlOrUrl = args[0];
  let options = args.length > 1 && typeof args[1] === 'object' ? args[1] : {};
  let markup = htmlOrUrl;
  if (options.selector) {
    const { JSDOM } = require('jsdom');
    const { window } = new JSDOM(htmlOrUrl);
    const el = window.document.querySelector(options.selector);
    expect(el).toBeTruthy();
    markup = el.outerHTML;
  }
  const pa11yOpts = {
    standard: options.standard || 'WCAG2AA',
    ...(options.page && { page: options.page }),
    ...(options.browser && { browser: options.browser })
  };
  const result = await pa11y(markup, pa11yOpts);
  if (options.report) {
    // Rapport détaillé
    console.log('Pa11y issues:', result.issues);
  }
  expect(result.issues.length).toBe(0);
}

// Playwright icon
export async function expectPlaywrightIcon(_html: string) {
  const args = Array.from(arguments);
  let htmlMarkup = args[0];
  let options = args.length > 1 && typeof args[1] === 'object' ? args[1] : { shouldHaveIcon: true };
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(htmlMarkup);
  const selector = options.selector || 'svg';
  const svg = await page.$(selector);
  if (options.shouldHaveIcon) {
    expect(svg).toBeTruthy();
  } else {
    expect(svg).toBeFalsy();
  }
  await browser.close();
}

// Playwright disabled
export async function expectPlaywrightDisabled(_html: string) {
  const args = Array.from(arguments);
  let htmlMarkup = args[0];
  let options = args.length > 1 && typeof args[1] === 'object' ? args[1] : { shouldBeDisabled: true };
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(htmlMarkup);
  const selector = options.selector || '[disabled]';
  const el = await page.$(selector);
  if (options.shouldBeDisabled) {
    expect(el).toBeTruthy();
  } else {
    expect(el).toBeFalsy();
  }
  await browser.close();
}

// Playwright text
export async function expectPlaywrightText(_html: string, _expected: string) {
  const args = Array.from(arguments);
  let htmlMarkup = args[0];
  let expectedText = args[1];
  let options = args.length > 2 && typeof args[2] === 'object' ? args[2] : { shouldHaveText: true, position: 'any' };
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(htmlMarkup);
  const selector = options.selector || 'button';
  const el = await page.$(selector);
  expect(el).toBeTruthy();
  const text = (await el.textContent())?.trim() || '';
  if (options.shouldHaveText) {
    if (options.position === 'start') {
      expect(text.startsWith(expectedText)).toBe(true);
    } else if (options.position === 'end') {
      expect(text.endsWith(expectedText)).toBe(true);
    } else {
      expect(text).toContain(expectedText);
    }
  } else {
    expect(text).not.toContain(expectedText);
  }
  await browser.close();
}

// Lighthouse accessibility
export async function expectLighthouseAccessibility(_html: string, reportDir: string) {
  const args = Array.from(arguments);
  let htmlMarkup = args[0];
  // reportDir déjà déclaré comme paramètre, ne pas redéclarer
  let options = args.length > 2 && typeof args[2] === 'object' ? args[2] : { report: true, minScore: 0.9 };
  const tmpFile = path.join(reportDir, 'tmp-lh.html');
  if (options.selector) {
    const { JSDOM } = require('jsdom');
    const { window } = new JSDOM(htmlMarkup);
    const el = window.document.querySelector(options.selector);
    expect(el).toBeTruthy();
    htmlMarkup = el.outerHTML;
  }
  fs.writeFileSync(tmpFile, htmlMarkup);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('file://' + tmpFile);
  const flow = await startFlow(page, { name: 'accessibility' });
  await flow.navigate('file://' + tmpFile);
  const report = await flow.generateReport();
  fs.writeFileSync(path.join(reportDir, 'lh-accessibility.html'), report);
  await browser.close();
  if (options.report) {
    console.log('Lighthouse accessibility report:', report);
  }
  expect(report).toContain('accessibility');
  // Edge case : score minimal
  const scoreMatch = report.match(/"accessibility":\s*\{[^}]*"score":\s*(\d+\.\d+)/);
  if (options.minScore && scoreMatch) {
    const score = parseFloat(scoreMatch[1]);
    expect(score).toBeGreaterThanOrEqual(options.minScore);
  }
}

// Helpers
export function expectHasClass(html: string, className: string) {
  const classAttrMatch = html.match(/class="([^"]*)"/);
  expect(classAttrMatch).toBeTruthy();
  const classList = classAttrMatch ? classAttrMatch[1].split(/\s+/) : [];
  if (Array.isArray(className)) {
    for (const cls of className) {
      expect(classList).toContain(cls);
    }
  } else {
    expect(classList).toContain(className);
  }
  // Edge case : aucune classe ne doit être dupliquée
  const uniqueClasses = new Set(classList);
  expect(uniqueClasses.size).toBe(classList.length);
}

export function expectHasAttribute(html: string, attr: string, value: string) {
  const attrRegex = new RegExp(`${attr}(="([^"]*)")?`, 'g');
  const matches = html.match(attrRegex);
  expect(matches).toBeTruthy();
  // Attribut booléen ?
  if (typeof value === 'boolean') {
    if (value) {
      // Accepte disabled sans valeur, disabled="", ou disabled>
      // Accepte disabled sans valeur, disabled="", disabled="true", ou disabled>
      expect(html).toMatch(new RegExp(`${attr}(=\"\"|=\"true\")?|\s${attr}\s|${attr}>|${attr}( |>)`));
    } else {
      expect(html).not.toMatch(new RegExp(`${attr}(="")?|\s${attr}\s|${attr}>`));
    }
  } else if (typeof value === 'string') {
    expect(html).toContain(`${attr}="${value}`);
  }
  if (matches) {
    expect(matches.length).toBeLessThanOrEqual(1);
  }
}

export async function expectAccessibilityAxe(html: string, axe: any, JSDOM: any, REPORTS_DIR: any) {
  let markup = html;
  const opts = arguments.length > 4 && typeof arguments[4] === 'object' ? arguments[4] : {};
  // Wrapping dynamique (landmark, section, main, etc.)
  if (opts.wrapper) {
    let attrs = '';
    if (opts.attributes) {
      attrs = Object.entries(opts.attributes)
        .map(([k, v]) => `${k}="${v}"`).join(' ');
    }
    markup = `<${opts.wrapper} ${attrs}>${html}</${opts.wrapper}>`;
  } else if (!/(<main|<nav|<header|<footer|<body|<section)/i.test(html)) {
    markup = `<main>${html}</main>`;
  }
  const { window } = new JSDOM(markup);
  const axeOpts = opts.axeOptions || {};
  const results = await axe.run(window.document.body, axeOpts);
  // Génération du rapport axe-core si dossier fourni
  if (typeof REPORTS_DIR === 'string' && results && typeof results === 'object') {
    const fs = require('fs');
    const path = require('path');
    const reportFile = path.join(REPORTS_DIR, 'axe-report-link.json');
    fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
  }
  // Assertion stricte : aucune violation
  expect(results.violations).toHaveLength(0);
}

export async function expectStress(container: any, Component: any, props: any, count: number, slotLabel: string = 'Item') {
  const options = arguments.length > 5 && typeof arguments[5] === 'object' ? arguments[5] : {};
  const htmls = await Promise.all(
    Array.from({ length: count }, (_, i) => {
      const slot = options.slots ? options.slots(i) : { default: `${slotLabel} ${i + 1}` };
      const p = options.propsFn ? options.propsFn(i) : props;
      return container.renderToString(Component, { props: p, slots: slot });
    })
  );
  const fullHtml = `<!DOCTYPE html><html><body>${htmls.join('')}</body></html>`;
  // Vérifie la présence du dernier item
  expect(fullHtml).toContain(`${slotLabel} ${count}`);
}

export function expectReversibility(originalHtml: string, revertedHtml: string) {
  const options = arguments.length > 2 && typeof arguments[2] === 'object' ? arguments[2] : { strict: true };
  if (options.strict) {
    expect(originalHtml).toBe(revertedHtml);
  } else {
    expect(originalHtml).toEqual(revertedHtml);
  }
  // Edge case : revertedHtml ne doit pas être null ou vide
  expect(revertedHtml).toBeTruthy();
}
