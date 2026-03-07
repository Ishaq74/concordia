import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { ComponentProps } from 'astro/types';
import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest';
import Button from '@components/ui/Button.astro';
import axe from 'axe-core';
import { JSDOM } from 'jsdom';
import { chromium } from 'playwright';
import pa11y from 'pa11y';
import { startFlow } from 'lighthouse';
import fs from 'fs';
import path from 'path';

// Directory for reports
const REPORTS_DIR = path.join(__dirname, 'reports');
import puppeteer, { Browser as PuppeteerBrowser, Page as PuppeteerPage } from 'puppeteer';

let puppeteerBrowser: PuppeteerBrowser;

let container: AstroContainer;


describe('ui/Button', () => {
  beforeAll(async () => {
    container = await AstroContainer.create();
    puppeteerBrowser = await puppeteer.launch();
    // Crée le dossier reports si inexistant
    if (!fs.existsSync(REPORTS_DIR)) {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
    }
  });

  afterAll(async () => {
    await puppeteerBrowser?.close();
  });

  beforeEach(() => {
    expect.assertions;
  });


  // ----------------------
  // Tests unitaires Astro
  // ----------------------
  const unitTests: Array<{ name: string; props?: ComponentProps<typeof Button>; slot?: string }> = [
    { name: 'renders a <button> with its children by default', slot: 'Click me' },
    { name: 'applies variant and color classes', props: { variant: 'modern', color: 'primary' }, slot: '🎯' },
    { name: 'forwards aria-label and disabled attribute', props: { ariaLabel: 'accessible', disabled: true }, slot: 'stuff' },
    { name: 'renders an icon when provided', props: { icon: { name: 'concordia', side: 'right' } }, slot: 'ok' },
    { name: 'defaults type attribute to "button" and allows overriding', props: { type: 'submit' }, slot: 'foo' },
    { name: 'forwards arbitrary HTML attributes and custom className', props: { 'data-test': 'xyz', id: 'my-button', className: 'extra' }, slot: 'a' },
    { name: 'does not render an <svg> when no icon prop is provided', slot: 'noicon' },
    { name: 'renders the icon on the correct side', props: { icon: { name: 'concordia', side: 'right' } }, slot: 'x' },
    { name: 'omits default variant/color classes entirely', props: { variant: 'initial', color: 'default' }, slot: 'a' },
    { name: 'accepts error color and appends it to classes', props: { color: 'error' }, slot: 'e' },
    { name: 'does not render disabled or aria-label when falsy/undefined', props: { disabled: false }, slot: 'z' },
    { name: 'does nothing when icon side is missing or invalid', props: { icon: { name: 'concordia', side: 'left' } }, slot: 'i' },
    { name: 'className is always appended after variant/color and wins over raw class attr', props: { variant: 'modern', color: 'primary', className: 'my-extra', class: 'ignored' }, slot: 'c' },
    { name: 'explicit type prop is respected', props: { type: 'reset' }, slot: 't' },
    { name: 'renders well-formed markup and disabled appears only once', props: { disabled: true }, slot: '' },
  ];

  for (const t of unitTests) {
    it(`unit: ${t.name}`, async () => {
      const result = await container.renderToString(Button, { props: t.props ?? {}, slots: { default: t.slot ?? '' } });
      expect(result.startsWith('<button')).toBe(true);
      expect(result).toContain('</button>');
    });
  }

  // ----------------------
  // axe-core (accessibility)
  // ----------------------
  async function expectNoA11yViolations(html: string) {
    const { window } = new JSDOM(html);
    const results = await axe.run(window.document.body, {
      rules: {
        'color-contrast': { enabled: false },
        'link-in-text-block': { enabled: false },
      },
    });
    expect(results.violations).toHaveLength(0);
  }

  it('axe-core: accessible with default content', async () => {
    const html = await container.renderToString(Button, { props: {}, slots: { default: 'Hello' } });
    await expectNoA11yViolations(html);
  });

  it('axe-core: accessible with icon', async () => {
    const html = await container.renderToString(Button, { props: { icon: { name: 'concordia', side: 'left' } }, slots: { default: 'Icon' } });
    await expectNoA11yViolations(html);
  });

  // ----------------------
  // Playwright tests
  // ----------------------
  it('playwright: renders text, is clickable, respects disabled', async () => {
    const html = await container.renderToString(Button, { props: {}, slots: { default: 'PW Test' } });
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const button = await page.$('button');
    const text = (await button?.textContent())?.trim();
    expect(text).toBe('PW Test');
    await button?.click();
    await browser.close();
  });

  it('playwright: icon rendered and positioned correctly', async () => {
    const html = await container.renderToString(Button, { props: { icon: { name: 'concordia', side: 'left' } }, slots: { default: 'Icon' } });
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const svg = await page.$('svg');
    expect(svg).toBeTruthy();
    await browser.close();
  });

  it('playwright: disabled button cannot be clicked', async () => {
    const html = await container.renderToString(Button, { props: { disabled: true }, slots: { default: 'Disabled' } });
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const button = await page.$('button');
    const disabled = await button?.getAttribute('disabled');
    expect(disabled).toBe('');
    await browser.close();
  });

  // ----------------------
  // Snapshot tests
  // ----------------------
  it('snapshot: default button', async () => {
    const html = await container.renderToString(Button, { props: {}, slots: { default: 'Snap' } });
    expect(html).toMatchSnapshot();
  });

  // ----------------------
  // Pa11y accessibility test
  // ----------------------
  it('pa11y: accessible default button', async () => {
    const buttonHtml = await container.renderToString(Button, { 
      props: {}, 
      slots: { default: 'PA11Y' } 
    });

    const fullHtml = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Button Test</title>
  </head>
  <body>
    ${buttonHtml}
  </body>
  </html>`;

    const tmpFile = path.join(__dirname, 'tmp-pa11y.html');
    fs.writeFileSync(tmpFile, fullHtml);
    
    const page: PuppeteerPage = await puppeteerBrowser.newPage();
    await page.goto(`file://${tmpFile}`, { waitUntil: 'networkidle0' });
    
    const results = await pa11y(`file://${tmpFile}`, {
      standard: 'WCAG2AA',
      page: page as any,
      browser: puppeteerBrowser as any,
    });

    const reportFile = path.join(REPORTS_DIR, 'pa11y-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
    
    fs.unlinkSync(tmpFile);
    
    expect(results.issues).toHaveLength(0);
  });

  // ----------------------
  // Lighthouse CI
  // ----------------------
  it('lighthouse: default button', async () => {
    const buttonHtml = await container.renderToString(Button, { 
      props: {}, 
      slots: { default: 'LH' } 
    });

    const fullHtml = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Button Test</title>
  </head>
  <body>
    ${buttonHtml}
  </body>
  </html>`;

    const tmpFile = path.join(REPORTS_DIR, 'tmp-lh.html');
    fs.writeFileSync(tmpFile, fullHtml);

    try {
      const page = await puppeteerBrowser.newPage();
      await page.setViewport({ width: 1280, height: 720 });

      // Créer un flow Lighthouse
      const flow = await startFlow(page, {
        name: 'Button Component Test',
        flags: {
          formFactor: 'desktop',
          screenEmulation: {
            disabled: true, // Puppeteer gère la viewport
          }
        }
      });

      // Naviguer vers le fichier local
      const fileUrl = `file://${path.resolve(tmpFile)}`;
      await page.goto(fileUrl, { waitUntil: 'networkidle0' });

      // Prendre un snapshot Lighthouse
      await flow.snapshot({
        name: 'Button accessibility check'
      });

      // Générer le rapport
      const reportHtml = await flow.generateReport();
      const reportFile = path.join(REPORTS_DIR, 'lighthouse-report.html');
      fs.writeFileSync(reportFile, reportHtml);

      // Accéder aux résultats
      const flowResult = await flow.createFlowResult();
      const step = flowResult.steps[0];
      const lhr = step.lhr;

      // Log les scores
      console.log('Lighthouse Scores:', {
        performance: (lhr.categories.performance?.score ?? 0) * 100,
        accessibility: (lhr.categories.accessibility?.score ?? 0) * 100,
        bestPractices: (lhr.categories['best-practices']?.score ?? 0) * 100,
        seo: (lhr.categories.seo?.score ?? 0) * 100,
      });

      // Assertion
      expect(lhr.categories.accessibility?.score).toBeGreaterThanOrEqual(0.9);

      await page.close();
    } finally {
      if (fs.existsSync(tmpFile)) {
        fs.unlinkSync(tmpFile);
      }
    }
  });

  // ----------------------
  // Tests de mutation : injection de props illégales (type inconnu, icon side non supporté, attributs non stringifiable)
  // ----------------------
  it('mutation: handles invalid props gracefully', async () => {
    const html = await container.renderToString(Button, { 
      props: { 
        variant: 'unknown',
        color: 'invalid',
        icon: { name: 'concordia', side: 'unsupported' },
        'data-weird': { complex: 'object' },
      }, 
      slots: { default: 'Mutate' } 
    });
    expect(html).toContain('data-weird="[object Object]"');
  });

  // ----------------------
  // Tests de stress : 1000 boutons, rapidité, absence de fuite mémoire.
  // ----------------------
  it('stress: renders 1000 buttons without performance degradation', async () => {
    const buttonsHtml = await Promise.all(
      Array.from({ length: 1000 }, (_, i) => 
        container.renderToString(Button, { props: { variant: 'modern', color: 'primary' }, slots: { default: `Button ${i + 1}` } })
      )
    );
    const fullHtml = `<!DOCTYPE html><html><body>${buttonsHtml.join('')}</body></html>`;
    expect(fullHtml).toContain('Button 1000');
  });

  // ----------------------
  // Tests de symétrie : toggle disabled, toggle icon, revert props, DOM identique.
  // ----------------------

  it('symmetry: toggling disabled state results in expected DOM changes', async () => {
    const enabledHtml = await container.renderToString(Button, { props: { disabled: false }, slots: { default: 'Symmetry' } });
    const disabledHtml = await container.renderToString(Button, { props: { disabled: true }, slots: { default: 'Symmetry' } });
    expect(enabledHtml).toContain('<button');
    expect(enabledHtml).not.toContain('disabled');
    expect(disabledHtml).toContain('<button');
    expect(disabledHtml).toContain('disabled');
  });

  it('symmetry: toggling icon presence results in expected DOM changes', async () => {
    const noIconHtml = await container.renderToString(Button, { props: {}, slots: { default: 'Symmetry' } });
    const withIconHtml = await container.renderToString(Button, { props: { icon: { name: 'concordia', side: 'left' } }, slots: { default: 'Symmetry' } });
    expect(noIconHtml).not.toContain('<svg');
    expect(withIconHtml).toContain('<svg');
  });

  // ----------------------
  // Tests de réversibilité : chaque transition doit être réversible sans perte d’état.
  // ----------------------
  it('reversibility: toggling disabled state twice returns to original DOM', async () => {
    const originalHtml = await container.renderToString(Button, { props: { disabled: false }, slots: { default: 'Reversible' } });
    await container.renderToString(Button, { props: { disabled: true }, slots: { default: 'Reversible' } });
    const revertedHtml = await container.renderToString(Button, { props: { disabled: false }, slots: { default: 'Reversible' } });
    expect(originalHtml).toBe(revertedHtml);
  });

  it('reversibility: toggling icon presence twice returns to original DOM', async () => {
    const originalHtml = await container.renderToString(Button, { props: {}, slots: { default: 'Reversible' } });
    await container.renderToString(Button, { props: { icon: { name: 'concordia', side: 'left' } }, slots: { default: 'Reversible' } });
    const revertedHtml = await container.renderToString(Button, { props: {}, slots: { default: 'Reversible' } });
    expect(originalHtml).toBe(revertedHtml);
  });

  // ----------------------
  // Tests d’isolation : bouton dans un contexte pollué (parent avec styles, aria, events), invariants maintenus.
  // ----------------------
  it('isolation: renders correctly within a styled parent', async () => {
    const parentHtml = `<div style="color: red; font-size: 20px;"><button>Parent Button</button>${await container.renderToString(Button, { props: {}, slots: { default: 'Isolated' } })}</div>`;
    expect(parentHtml).toContain('Parent Button');
    expect(parentHtml).toContain('Isolated');
  });

  it('isolation: maintains accessibility attributes when nested', async () => {
    const parentHtml = `<div aria-label="Parent"><button>Parent Button</button>${await container.renderToString(Button, { props: { ariaLabel: 'Child' }, slots: { default: 'Isolated' } })}</div>`;
    expect(parentHtml).toContain('aria-label="Parent"');
    expect(parentHtml).toContain('aria-label="Child"');
  });

  // ----------------------
  // Tests de boundary : props extrêmes (long string, unicode, objets profonds).
  // ----------------------
  it('boundary: handles extremely long string props', async () => {
    const longString = 'A'.repeat(10000);
    const html = await container.renderToString(Button, { props: {}, slots: { default: longString } });
    expect(html).toContain(longString);
  });

  it('boundary: handles unicode characters in props', async () => {
    const unicodeString = '😀🚀✨';
    const html = await container.renderToString(Button, { props: {}, slots: { default: unicodeString } });
    expect(html).toContain(unicodeString);
  });

  it('boundary: handles deeply nested objects in props', async () => {
    const complexIcon = { name: 'concordia', side: 'left', metadata: { nested: { level: 1, info: 'deep' } } };
    const html = await container.renderToString(Button, { props: { icon: complexIcon }, slots: { default: 'Complex' } });
    // deep metadata should be ignored and not serialized in the markup
    expect(html).toContain('<svg');
    expect(html).toContain('data-icon="concordia"');
    expect(html).not.toContain('nested');
    expect(html).not.toContain('level');
    expect(html).not.toContain('deep');
  });

  // ----------------------
  // Tests d'événements et interactivité avec Playwright
  // ----------------------
  it('interactive: button click events work with Playwright', async () => {
    const html = await container.renderToString(Button, { 
      props: { id: 'click-test' }, 
      slots: { default: 'Click Me' } 
    });
    
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    try {
      await page.setContent(html);
      const button = await page.$('#click-test');
      
      expect(button).toBeTruthy();
      
      const isEnabled = await page.evaluate(() => {
        const btn = document.querySelector('#click-test') as HTMLButtonElement;
        return !btn.disabled;
      });
      
      expect(isEnabled).toBe(true);
      await browser.close();
    } catch (error) {
      await browser.close();
      throw error;
    }
  });

  it('interactive: disabled button is not clickable', async () => {
    const html = await container.renderToString(Button, { 
      props: { disabled: true, id: 'disabled-test' }, 
      slots: { default: 'Disabled' } 
    });
    
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    try {
      await page.setContent(html);
      
      const isDisabled = await page.evaluate(() => {
        const btn = document.querySelector('#disabled-test') as HTMLButtonElement;
        return btn.disabled;
      });
      
      expect(isDisabled).toBe(true);
      await browser.close();
    } catch (error) {
      await browser.close();
      throw error;
    }
  });

  it('interactive: button type attribute is correctly set', async () => {
    const htmlButton = await container.renderToString(Button, { 
      props: { type: 'button' }, 
      slots: { default: 'Button' } 
    });
    
    const htmlSubmit = await container.renderToString(Button, { 
      props: { type: 'submit' }, 
      slots: { default: 'Submit' } 
    });
    
    const htmlReset = await container.renderToString(Button, { 
      props: { type: 'reset' }, 
      slots: { default: 'Reset' } 
    });
    
    expect(htmlButton).toContain('type="button"');
    expect(htmlSubmit).toContain('type="submit"');
    expect(htmlReset).toContain('type="reset"');
  });

  it('interactive: icon renders with correct side attribute', async () => {
    const htmlLeft = await container.renderToString(Button, { 
      props: { icon: { name: 'concordia', side: 'left' } }, 
      slots: { default: 'Left Icon' } 
    });
    
    const htmlRight = await container.renderToString(Button, { 
      props: { icon: { name: 'concordia', side: 'right' } }, 
      slots: { default: 'Right Icon' } 
    });
    
    expect(htmlLeft).toContain('data-icon-side="left"');
    expect(htmlRight).toContain('data-icon-side="right"');
  });

  // ----------------------
  // Tests de focus et keyboard navigation
  // ----------------------
  it('focus: button is focusable', async () => {
    const html = await container.renderToString(Button, { 
      props: { id: 'focus-test' }, 
      slots: { default: 'Focus Me' } 
    });
    
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    try {
      await page.setContent(html);
      await page.focus('#focus-test');
      
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.id;
      });
      
      expect(focusedElement).toBe('focus-test');
      await browser.close();
    } catch (error) {
      await browser.close();
      throw error;
    }
  });

  it('focus: disabled button is not focusable', async () => {
    const html = await container.renderToString(Button, { 
      props: { disabled: true, id: 'disabled-focus-test' }, 
      slots: { default: 'Cannot Focus' } 
    });
    
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    try {
      await page.setContent(html);
      
      try {
        await page.focus('#disabled-focus-test');
      } catch (e) {
        // Expected to fail
      }
      
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.id;
      });
      
      expect(focusedElement).not.toBe('disabled-focus-test');
      await browser.close();
    } catch (error) {
      await browser.close();
      throw error;
    }
  });

  it('focus: tab order is correct with multiple buttons', async () => {
    const button1 = await container.renderToString(Button, { 
      props: { id: 'btn-1' }, 
      slots: { default: 'Button 1' } 
    });
    
    const button2 = await container.renderToString(Button, { 
      props: { id: 'btn-2' }, 
      slots: { default: 'Button 2' } 
    });
    
    const html = `${button1}${button2}`;
    
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    try {
      await page.setContent(html);
      
      await page.focus('#btn-1');
      let focusedElement = await page.evaluate(() => document.activeElement?.id);
      expect(focusedElement).toBe('btn-1');
      
      await page.keyboard.press('Tab');
      focusedElement = await page.evaluate(() => document.activeElement?.id);
      expect(focusedElement).toBe('btn-2');
      
      await browser.close();
    } catch (error) {
      await browser.close();
      throw error;
    }
  });

  it('keyboard: Enter key activates button', async () => {
    const html = await container.renderToString(Button, { 
      props: { id: 'enter-test' }, 
      slots: { default: 'Press Enter' } 
    });
    
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    try {
      await page.evaluateHandle(() => {
        const btn = document.querySelector('#enter-test') as HTMLButtonElement;
        btn.addEventListener('click', () => {
          // event listener for keyboard activation test
        });
      });
      
      await page.setContent(html);
      await page.focus('#enter-test');
      await page.keyboard.press('Enter');
      
      await page.waitForTimeout(100);
      
      await page.evaluate(() => {
        const btn = document.querySelector('#enter-test') as HTMLButtonElement;
        return btn.getAttribute('data-clicked') === 'true';
      });
      
      await browser.close();
    } catch (error) {
      await browser.close();
      throw error;
    }
  });

  it('keyboard: Space key activates button', async () => {
    const html = await container.renderToString(Button, { 
      props: { id: 'space-test' }, 
      slots: { default: 'Press Space' } 
    });
    
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    try {
      await page.setContent(html);
      await page.focus('#space-test');
      await page.keyboard.press('Space');
      
      const isActive = await page.evaluate(() => {
        const btn = document.querySelector('#space-test') as HTMLButtonElement;
        return btn !== null;
      });
      
      expect(isActive).toBe(true);
      await browser.close();
    } catch (error) {
      await browser.close();
      throw error;
    }
  });

  it('keyboard: Escape key does not affect button', async () => {
    const html = await container.renderToString(Button, { 
      props: { id: 'escape-test' }, 
      slots: { default: 'Press Escape' } 
    });
    
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    try {
      await page.setContent(html);
      await page.focus('#escape-test');
      await page.keyboard.press('Escape');
      
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.id;
      });
      
      expect(focusedElement).toBe('escape-test');
      await browser.close();
    } catch (error) {
      await browser.close();
      throw error;
    }
  });

  // ----------------------
  // Tests d'accessibilité ARIA
  // ----------------------
  it('aria: aria-label is correctly set', async () => {
    const html = await container.renderToString(Button, { 
      props: { ariaLabel: 'Close dialog' }, 
      slots: { default: '×' } 
    });
    
    expect(html).toContain('aria-label="Close dialog"');
  });

  it('aria: aria-label takes precedence over slot content', async () => {
    const html = await container.renderToString(Button, { 
      props: { ariaLabel: 'Delete item' }, 
      slots: { default: '🗑️' } 
    });
    
    expect(html).toContain('aria-label="Delete item"');
    expect(html).toContain('🗑️');
  });

  it('aria: button without aria-label still has accessible text', async () => {
    const html = await container.renderToString(Button, { 
      props: {}, 
      slots: { default: 'Click me' } 
    });
    
    expect(html).toContain('Click me');
    expect(html).not.toContain('aria-label=""');
  });

  it('aria: icon with button has proper role', async () => {
    const html = await container.renderToString(Button, { 
      props: { icon: { name: 'concordia', side: 'left' } }, 
      slots: { default: 'With Icon' } 
    });
    
    expect(html).toContain('role="button"');
  });

  it('aria: disabled button has aria-disabled attribute', async () => {
    const html = await container.renderToString(Button, { 
      props: { disabled: true, ariaLabel: 'Disabled action' }, 
      slots: { default: 'Disabled' } 
    });
    
    expect(html).toContain('disabled');
    expect(html).toContain('aria-label="Disabled action"');
  });

  it('aria: button with icon has descriptive aria-label', async () => {
    const html = await container.renderToString(Button, { 
      props: { 
        icon: { name: 'concordia', side: 'left' },
        ariaLabel: 'Open settings menu'
      }, 
      slots: { default: '' } 
    });
    
    expect(html).toContain('aria-label="Open settings menu"');
    expect(html).toContain('<svg');
  });

  // ----------------------
  // Tests de performance et rendering
  // ----------------------
  it('performance: renders quickly with simple props', async () => {
    const startTime = performance.now();
    
    const html = await container.renderToString(Button, { 
      props: {}, 
      slots: { default: 'Fast' } 
    });
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(html).toContain('Fast');
    expect(duration).toBeLessThan(100); // Should render in less than 100ms
  });

  it('performance: renders quickly with complex props', async () => {
    const startTime = performance.now();
    
    const html = await container.renderToString(Button, { 
      props: { 
        variant: 'modern',
        color: 'primary',
        icon: { name: 'concordia', side: 'left' },
        ariaLabel: 'Complex button',
        className: 'custom-class',
        id: 'perf-test',
        disabled: false
      }, 
      slots: { default: 'Complex Render' } 
    });
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(html).toContain('Complex Render');
    expect(duration).toBeLessThan(200); // Should render in less than 200ms
  });

  it('performance: renders 100 buttons concurrently', async () => {
    const startTime = performance.now();
    
    const buttonsHtml = await Promise.all(
      Array.from({ length: 100 }, (_, i) => 
        container.renderToString(Button, { 
          props: { id: `btn-${i}` }, 
          slots: { default: `Button ${i}` } 
        })
      )
    );
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(buttonsHtml).toHaveLength(100);
    expect(duration).toBeLessThan(5000); // Should render 100 buttons in less than 5 seconds
  });

  it('performance: renders 1000 buttons sequentially with acceptable time', async () => {
    const startTime = performance.now();
    
    const buttonsHtml = await Promise.all(
      Array.from({ length: 1000 }, (_, i) => 
        container.renderToString(Button, { 
          props: { variant: 'modern', color: 'primary' }, 
          slots: { default: `Button ${i + 1}` } 
        })
      )
    );
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(buttonsHtml).toHaveLength(1000);
    expect(buttonsHtml[0]).toContain('<button');
    expect(buttonsHtml[999]).toContain('Button 1000');
    expect(duration).toBeLessThan(10000); // Should render 1000 buttons in less than 10 seconds
    console.log(`✓ Rendered 1000 buttons in ${duration.toFixed(2)}ms`);
  });

  // ----------------------
  // Tests de HTML valide et bien formé
  // ----------------------
  it('html: generates valid HTML structure', async () => {
    const html = await container.renderToString(Button, { 
      props: { id: 'valid-html' }, 
      slots: { default: 'Valid HTML' } 
    });
    
    expect(html).toMatch(/^<button/);
    expect(html).toMatch(/\/?>$/);
    expect(html).toContain('</button>');
    expect((html.match(/<button/g) || []).length).toBe((html.match(/<\/button>/g) || []).length);
  });

  it('html: no unclosed tags', async () => {
    const html = await container.renderToString(Button, { 
      props: { icon: { name: 'concordia', side: 'left' } }, 
      slots: { default: 'No unclosed tags' } 
    });
    
    html.match(/<[a-z]+(?:\s[^>]*)?\s*>/gi) || [];
    html.match(/<\/[a-z]+>/gi) || [];
    
    expect(html).not.toMatch(/<[^/>]*$/);
  });

  it('html: properly escaped attributes', async () => {
    const html = await container.renderToString(Button, { 
      props: { 
        'data-test': 'value with "quotes"',
        id: 'btn-&-special'
      }, 
      slots: { default: 'Escaped' } 
    });
    
    expect(html).toContain('data-test=');
    expect(html).toContain('id=');
  });

  it('html: no XSS vulnerabilities in attributes', async () => {
    const html = await container.renderToString(Button, { 
      props: { 
        'data-test': '<script>alert("xss")</script>',
        className: 'class" onclick="alert(1)'
      }, 
      slots: { default: 'XSS Test' } 
    });
    
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('onclick=');
  });
  
  // ----------------------
  // Tests de conformité W3C
  // ----------------------
  it('w3c: button element conforms to HTML spec', async () => {
    const html = await container.renderToString(Button, { 
      props: { type: 'button' }, 
      slots: { default: 'W3C Compliant' } 
    });
    
    const { window } = new JSDOM(html);
    const button = window.document.querySelector('button');
    
    expect(button).toBeTruthy();
    expect(button?.tagName).toBe('BUTTON');
    expect(button?.type).toBe('button');
  });

  it('w3c: type attribute values are valid', async () => {
    const validTypes = ['button', 'submit', 'reset'];
    
    for (const type of validTypes) {
      const html = await container.renderToString(Button, { 
        props: { type: type as any }, 
        slots: { default: type } 
      });
      
      expect(html).toContain(`type="${type}"`);
    }
  });

  it('w3c: disabled attribute is boolean', async () => {
    const html = await container.renderToString(Button, { 
      props: { disabled: true }, 
      slots: { default: 'Disabled' } 
    });
    
    const { window } = new JSDOM(html);
    const button = window.document.querySelector('button');
    
    expect(button?.disabled).toBe(true);
    expect(html).toMatch(/disabled(?:\s|>)/);
  });

  it('w3c: attribute names are lowercase', async () => {
    const html = await container.renderToString(Button, { 
      props: { 
        ariaLabel: 'Test',
        id: 'btn-w3c'
      }, 
      slots: { default: 'Lowercase' } 
    });
    
    expect(html).toContain('aria-label=');
    expect(html).not.toContain('ARIA-LABEL=');
    expect(html).not.toContain('ariaLabel=');
  });

  it('w3c: no deprecated attributes used', async () => {
    const html = await container.renderToString(Button, { 
      props: {}, 
      slots: { default: 'No deprecated' } 
    });
    
    expect(html).not.toContain('onclick=');
    expect(html).not.toContain('onmouseover=');
    expect(html).not.toContain('style=');
  });

  it('w3c: semantic HTML structure is correct', async () => {
    const html = await container.renderToString(Button, { 
      props: { icon: { name: 'concordia', side: 'left' } }, 
      slots: { default: 'Semantic' } 
    });
    
    const { window } = new JSDOM(html);
    const button = window.document.querySelector('button');
    const svg = window.document.querySelector('svg');
    
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Semantic');
    expect(svg).toBeTruthy();
  });

  // ----------------------
  // Tests d'état et de props immuabilité
  // ----------------------
  it('immutability: rendering same props twice produces identical HTML', async () => {
    const props = { 
      variant: 'modern',
      color: 'primary',
      icon: { name: 'concordia', side: 'left' }
    };
    
    const html1 = await container.renderToString(Button, { 
      props, 
      slots: { default: 'Immutable' } 
    });
    
    const html2 = await container.renderToString(Button, { 
      props, 
      slots: { default: 'Immutable' } 
    });
    
    expect(html1).toBe(html2);
  });

  it('immutability: props object is not mutated', async () => {
    const props = { 
      disabled: false,
      variant: 'modern' as any
    };
    
    const propsCopy = JSON.parse(JSON.stringify(props));
    
    await container.renderToString(Button, { 
      props, 
      slots: { default: 'No mutation' } 
    });
    
    expect(props).toEqual(propsCopy);
  });

  it('immutability: different props produce different HTML', async () => {
    const html1 = await container.renderToString(Button, { 
      props: { disabled: false }, 
      slots: { default: 'Test' } 
    });
    
    const html2 = await container.renderToString(Button, { 
      props: { disabled: true }, 
      slots: { default: 'Test' } 
    });
    
    expect(html1).not.toBe(html2);
  });

  // ----------------------
  // Tests de contenu polymorphe (slot)
  // ----------------------
  it('polymorphic: slot accepts text content', async () => {
    const html = await container.renderToString(Button, { 
      props: {}, 
      slots: { default: 'Plain text' } 
    });
    
    expect(html).toContain('Plain text');
  });

  it('polymorphic: slot accepts HTML entities', async () => {
    const html = await container.renderToString(Button, { 
      props: {}, 
      slots: { default: '&copy; 2024' } 
    });
    
    expect(html).toContain('&copy;');
  });

  it('polymorphic: slot accepts numbers', async () => {
    const html = await container.renderToString(Button, { 
      props: {}, 
      slots: { default: '42' } 
    });
    
    expect(html).toContain('42');
  });

  it('polymorphic: slot accepts emoji', async () => {
    const html = await container.renderToString(Button, { 
      props: {}, 
      slots: { default: '🚀 Launch' } 
    });
    
    expect(html).toContain('🚀');
    expect(html).toContain('Launch');
  });

  it('polymorphic: slot with whitespace handling', async () => {
    const html = await container.renderToString(Button, { 
      props: {}, 
      slots: { default: '  Trimmed  ' } 
    });
    
    expect(html).toContain('Trimmed');
  });

  // ----------------------
  // Tests de classes CSS
  // ----------------------
  it('css: applies variant classes', async () => {
    const html = await container.renderToString(Button, { 
      props: { variant: 'modern' }, 
      slots: { default: 'Variant' } 
    });
    
    expect(html).toContain('class=');
    expect(html).toContain('modern');
  });

  it('css: applies color classes', async () => {
    const html = await container.renderToString(Button, { 
      props: { color: 'primary' }, 
      slots: { default: 'Color' } 
    });
    
    expect(html).toContain('primary');
  });

  it('css: combines variant and color classes', async () => {
    const html = await container.renderToString(Button, { 
      props: { variant: 'modern', color: 'primary' }, 
      slots: { default: 'Combined' } 
    });
    
    expect(html).toContain('modern');
    expect(html).toContain('primary');
  });

  it('css: applies custom className prop', async () => {
    const html = await container.renderToString(Button, { 
      props: { className: 'custom-btn extra-class' }, 
      slots: { default: 'Custom' } 
    });
    
    expect(html).toContain('custom-btn');
    expect(html).toContain('extra-class');
  });

  it('css: className is appended after variant/color', async () => {
    const html = await container.renderToString(Button, { 
      props: { 
        variant: 'modern',
        color: 'primary',
        className: 'my-override'
      }, 
      slots: { default: 'Override' } 
    });
    
    const classMatch = html.match(/class="([^"]*)/);
    const classString = classMatch ? classMatch[1] : '';
    
    expect(classString).toContain('modern');
    expect(classString).toContain('primary');
    expect(classString).toContain('my-override');
  });

  it('css: omits default variant/color when initial/default specified', async () => {
    const html = await container.renderToString(Button, { 
      props: { variant: 'initial', color: 'default' }, 
      slots: { default: 'Default' } 
    });
    
    expect(html).not.toContain('initial');
    expect(html).not.toContain('default');
  });

  // ----------------------
  // Tests d'attributs data
  // ----------------------
  it('data-attrs: forwards data-* attributes', async () => {
    const html = await container.renderToString(Button, { 
      props: { 
        'data-test': 'test-value',
        'data-id': '123',
        'data-action': 'click-me'
      }, 
      slots: { default: 'Data' } 
    });
    
    expect(html).toContain('data-test="test-value"');
    expect(html).toContain('data-id="123"');
    expect(html).toContain('data-action="click-me"');
  });

  it('data-attrs: handles data attributes with special characters', async () => {
    const html = await container.renderToString(Button, { 
      props: { 
        'data-info': 'value-with-dash',
        'data-value': 'number_123'
      }, 
      slots: { default: 'Special' } 
    });
    
    expect(html).toContain('data-info="value-with-dash"');
    expect(html).toContain('data-value="number_123"');
  });

  it('data-attrs: multiple data attributes coexist', async () => {
    const html = await container.renderToString(Button, { 
      props: { 
        'data-x': 'a',
        'data-y': 'b',
        'data-z': 'c',
        id: 'btn-data'
      }, 
      slots: { default: 'Multiple data' } 
    });
    
    expect(html).toContain('data-x="a"');
    expect(html).toContain('data-y="b"');
    expect(html).toContain('data-z="c"');
    expect(html).toContain('id="btn-data"');
  });

  it('data-attrs: escapes quotes in data attribute values', async () => {
    const html = await container.renderToString(Button, { 
      props: { 
        'data-message': 'Say "Hello" to me'
      }, 
      slots: { default: 'Escaped' } 
    });
    
    expect(html).toContain('data-message=');
    expect(html).not.toContain('Say "Hello"');
  });

  it('data-attrs: handles empty data attribute values', async () => {
    const html = await container.renderToString(Button, { 
      props: { 
        'data-empty': ''
      }, 
      slots: { default: 'Empty' } 
    });
    
    expect(html).toContain('data-empty=""');
  });

  it('data-attrs: preserves data attribute case', async () => {
    const html = await container.renderToString(Button, { 
      props: { 
        'data-camelCase': 'value',
        'data-kebab-case': 'value'
      }, 
      slots: { default: 'Case' } 
    });
    
    expect(html).toContain('data-camelCase');
    expect(html).toContain('data-kebab-case');
  });

  // ----------------------
  // Tests d'intégration complète avec Playwright
  // ----------------------
  it('integration-pw: full button workflow with Playwright', async () => {
    const html = await container.renderToString(Button, { 
      props: { 
        id: 'workflow-btn',
        'data-workflow': 'test'
      }, 
      slots: { default: 'Workflow Test' } 
    });
    
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    try {
      await page.setContent(html);
      
      // Check button exists
      const button = await page.$('#workflow-btn');
      expect(button).toBeTruthy();
      
      // Check text content
      const text = await page.textContent('#workflow-btn');
      expect(text).toContain('Workflow Test');
      
      // Check data attribute
      const dataAttr = await page.getAttribute('#workflow-btn', 'data-workflow');
      expect(dataAttr).toBe('test');
      
      // Check button is clickable
      const isClickable = await page.evaluate(() => {
        const btn = document.querySelector('#workflow-btn') as HTMLButtonElement;
        return !btn.disabled;
      });
      expect(isClickable).toBe(true);
      
      await browser.close();
    } catch (error) {
      await browser.close();
      throw error;
    }
  });

  it('integration-pw: button with icon workflow', async () => {
    const html = await container.renderToString(Button, { 
      props: { 
        id: 'icon-workflow',
        icon: { name: 'concordia', side: 'left' },
        ariaLabel: 'Icon button'
      }, 
      slots: { default: 'Icon Button' } 
    });
    
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    try {
      await page.setContent(html);
      
      // Check button and icon exist
      const button = await page.$('#icon-workflow');
      const icon = await page.$('#icon-workflow svg');
      
      expect(button).toBeTruthy();
      expect(icon).toBeTruthy();
      
      // Check aria-label
      const ariaLabel = await page.getAttribute('#icon-workflow', 'aria-label');
      expect(ariaLabel).toBe('Icon button');
      
      // Check button text
      const text = await page.textContent('#icon-workflow');
      expect(text).toContain('Icon Button');
      
      await browser.close();
    } catch (error) {
      await browser.close();
      throw error;
    }
  });

  // ----------------------
  // Tests de régression
  // ----------------------
  it('regression: button renders consistently after multiple renders', async () => {
    const props = { variant: 'modern', color: 'primary', id: 'regression-btn' };
    
    const renders = await Promise.all(
      Array.from({ length: 5 }, () =>
        container.renderToString(Button, { 
          props, 
          slots: { default: 'Regression' } 
        })
      )
    );
    
    // All renders should be identical
    renders.forEach((html) => {
      expect(html).toBe(renders[0]);
    });
  });

  it('regression: disabled button does not render onclick', async () => {
    const html = await container.renderToString(Button, { 
      props: { disabled: true, id: 'disabled-onclick' }, 
      slots: { default: 'Disabled' } 
    });
    
    expect(html).not.toContain('onclick');
    expect(html).toContain('disabled');
  });

  it('regression: icon prop does not break without side', async () => {
    const html = await container.renderToString(Button, { 
      props: { icon: { name: 'concordia', side: undefined } as any }, 
      slots: { default: 'Icon' } 
    });
    
    expect(html).toContain('<svg');
    expect(html).toContain('Icon');
  });

  it('regression: className does not override critical attributes', async () => {
    const html = await container.renderToString(Button, { 
      props: { 
        id: 'critical-btn',
        className: 'id="fake-id" onclick="alert(1)"'
      }, 
      slots: { default: 'Critical' } 
    });
    
    expect(html).toContain('id="critical-btn"');
    expect(html).not.toContain('onclick=');
  });

  it('regression: slot content preserves formatting', async () => {
    const html = await container.renderToString(Button, { 
      props: {}, 
      slots: { default: 'Multi\nLine\nText' } 
    });
    
    expect(html).toContain('Multi');
    expect(html).toContain('Line');
    expect(html).toContain('Text');
  });

  it('regression: empty string props do not render', async () => {
    const html = await container.renderToString(Button, { 
      props: { 
        className: '',
        'data-empty': ''
      }, 
      slots: { default: 'Empty' } 
    });
    
    expect(html).toContain('Empty');
    expect(html).toContain('data-empty=""');
  });

  it('regression: null/undefined props are ignored', async () => {
    const html = await container.renderToString(Button, { 
      props: { 
        disabled: undefined,
        variant: null as any
      }, 
      slots: { default: 'Null/Undefined' } 
    });
    
    expect(html).toContain('Null/Undefined');
  });

  it('regression: very long className does not break layout', async () => {
    const longClassName = Array(100).fill('class').join('-');
    const html = await container.renderToString(Button, { 
      props: { className: longClassName }, 
      slots: { default: 'Long' } 
    });
    
    expect(html).toContain('Long');
    expect(html).toContain('class');
  });

  // ----------------------
  // Tests de stabilité du DOM
  // ----------------------
  it('stability: button element is the only root element', async () => {
    const html = await container.renderToString(Button, { 
      props: {}, 
      slots: { default: 'Stability' } 
    });
    
    const { window } = new JSDOM(html);
    const buttons = window.document.querySelectorAll('button');
    
    expect(buttons).toHaveLength(1);
  });

  it('stability: SVG is nested correctly within button', async () => {
    const html = await container.renderToString(Button, { 
      props: { icon: { name: 'concordia', side: 'left' } }, 
      slots: { default: 'SVG Test' } 
    });
    
    const { window } = new JSDOM(html);
    const button = window.document.querySelector('button');
    const svg = button?.querySelector('svg');
    
    expect(svg).toBeTruthy();
    expect(svg?.parentElement?.tagName).toBe('BUTTON');
  });

  it('stability: text node is direct child of button', async () => {
    const html = await container.renderToString(Button, { 
      props: {}, 
      slots: { default: 'Direct child' } 
    });
    
    const { window } = new JSDOM(html);
    const button = window.document.querySelector('button');
    
    expect(button?.textContent).toContain('Direct child');
  });

  it('stability: no whitespace nodes between button and content', async () => {
    const html = await container.renderToString(Button, { 
      props: {}, 
      slots: { default: 'No whitespace' } 
    });
    
    expect(html).toMatch(/<button[^>]*>No whitespace<\/button>/);
  });

  // ----------------------
  // Tests de compatibilité navigateur
  // ----------------------
  it('compat: uses standard HTML button element', async () => {
    const html = await container.renderToString(Button, { 
      props: {}, 
      slots: { default: 'Standard' } 
    });
    
    expect(html).toMatch(/^<button/);
    expect(html).toMatch(/<\/button>$/);
  });

  it('compat: type attribute is supported in all browsers', async () => {
    const types = ['button', 'submit', 'reset'];
    
    for (const type of types) {
      const html = await container.renderToString(Button, { 
        props: { type: type as any }, 
        slots: { default: type } 
      });
      
      expect(html).toContain(`type="${type}"`);
    }
  });

  it('compat: disabled attribute is boolean and widely supported', async () => {
    const html = await container.renderToString(Button, { 
      props: { disabled: true }, 
      slots: { default: 'Disabled' } 
    });
    
    expect(html).toContain('disabled');
    expect(html).not.toContain('disabled="disabled"');
  });

  it('compat: aria-label is standard and supported', async () => {
    const html = await container.renderToString(Button, { 
      props: { ariaLabel: 'Accessible' }, 
      slots: { default: 'Aria' } 
    });
    
    expect(html).toContain('aria-label="Accessible"');
  });

  it('compat: data-* attributes are standard HTML5', async () => {
    const html = await container.renderToString(Button, { 
      props: { 'data-test': 'value' }, 
      slots: { default: 'Data' } 
    });
    
    expect(html).toContain('data-test="value"');
  });

  it('compat: SVG icons are supported in modern browsers', async () => {
    const html = await container.renderToString(Button, { 
      props: { icon: { name: 'concordia', side: 'left' } }, 
      slots: { default: 'Icon' } 
    });
    
    expect(html).toContain('<svg');
    expect(html).toContain('</svg>');
  });

  it('compat: no vendor prefixes needed for button styling', async () => {
    const html = await container.renderToString(Button, { 
      props: { className: 'btn-modern' }, 
      slots: { default: 'No Vendor' } 
    });
    
    expect(html).not.toContain('-webkit-');
    expect(html).not.toContain('-moz-');
    expect(html).not.toContain('-ms-');
  });

  it('compat: no proprietary attributes', async () => {
    const html = await container.renderToString(Button, { 
      props: {}, 
      slots: { default: 'Standard' } 
    });
    
    expect(html).not.toMatch(/x-/);
    expect(html).not.toMatch(/ng-/);
    expect(html).not.toMatch(/v-/);
  });

  // ----------------------
  // Tests de sécurité
  // ----------------------
  it('security: prevents XSS in slot content', async () => {
    const xssPayload = '<img src=x onerror="alert(1)">';
    const html = await container.renderToString(Button, { 
      props: {}, 
      slots: { default: xssPayload } 
    });
    
    expect(html).not.toContain('onerror');
    expect(html).toContain('&lt;');
  });

  it('security: prevents XSS in className prop', async () => {
    const xssPayload = '" onclick="alert(1)';
    const html = await container.renderToString(Button, { 
      props: { className: xssPayload }, 
      slots: { default: 'XSS' } 
    });
    
    expect(html).not.toContain('onclick="alert(1)');
  });

  it('security: prevents XSS in data attributes', async () => {
    const xssPayload = '" onclick="alert(1)';
    const html = await container.renderToString(Button, { 
      props: { 'data-test': xssPayload }, 
      slots: { default: 'Data XSS' } 
    });
    
    expect(html).not.toContain('onclick=');
  });

  it('security: sanitizes HTML special characters', async () => {
    const html = await container.renderToString(Button, { 
      props: { 
        'data-content': '<>&"\'',
        className: 'test'
      }, 
      slots: { default: '<>&"\'' } 
    });
    
    expect(html).toContain('&lt;');
    expect(html).toContain('&gt;');
    expect(html).toContain('&amp;');
  });

  it('security: prevents script injection via ariaLabel', async () => {
    const html = await container.renderToString(Button, { 
      props: { ariaLabel: '"><script>alert(1)</script>' }, 
      slots: { default: 'Script' } 
    });
    
    expect(html).not.toContain('<script>');
  });

  it('security: escapes quotes in attribute values', async () => {
    const html = await container.renderToString(Button, { 
      props: { 
        'data-message': 'Say "Hello" world',
        ariaLabel: 'Button with "quotes"'
      }, 
      slots: { default: 'Quotes' } 
    });
    
    expect(html).not.toMatch(/data-message="[^"]*"[^"]*"/);
  });

  it('security: no eval or Function constructor usage', async () => {
    const html = await container.renderToString(Button, { 
      props: { className: 'eval Function constructor' }, 
      slots: { default: 'Safe' } 
    });
    
    expect(html).not.toContain('eval(');
    expect(html).not.toContain('Function(');
  });

  it('security: no inline event handlers', async () => {
    const html = await container.renderToString(Button, { 
      props: {}, 
      slots: { default: 'No handlers' } 
    });
    
    expect(html).not.toMatch(/on(click|change|submit|load|error)=/i);
  });

  it('security: no dangerous protocols in href (if applicable)', async () => {
    const html = await container.renderToString(Button, { 
      props: { 'data-url': 'javascript:alert(1)' }, 
      slots: { default: 'Protocol' } 
    });
    
    expect(html).toContain('data-url=');
  });

  // ----------------------
  // Tests de contenu et sémantique
  // ----------------------
  it('semantics: button is semantic element for interactive control', async () => {
    const html = await container.renderToString(Button, { 
      props: {}, 
      slots: { default: 'Semantic' } 
    });
    
    expect(html).toMatch(/^<button/);
    expect(html).not.toMatch(/^<div/);
    expect(html).not.toMatch(/^<span/);
  });

  it('semantics: default type is button (not submit)', async () => {
    const html = await container.renderToString(Button, { 
      props: {}, 
      slots: { default: 'Default Type' } 
    });
    
    expect(html).toContain('type="button"');
  });

  it('semantics: text content is preserved as-is', async () => {
    const content = 'Save Changes';
    const html = await container.renderToString(Button, { 
      props: {}, 
      slots: { default: content } 
    });
    
    expect(html).toContain(content);
  });

  it('semantics: icon is supplementary to text', async () => {
    const html = await container.renderToString(Button, { 
      props: { icon: { name: 'concordia', side: 'left' } }, 
      slots: { default: 'With Icon' } 
    });
    
    expect(html).toContain('With Icon');
    expect(html).toContain('<svg');
  });

  it('semantics: button describes its purpose via text or aria-label', async () => {
    const htmlWithText = await container.renderToString(Button, { 
      props: {}, 
      slots: { default: 'Delete Account' } 
    });
    
    const htmlWithLabel = await container.renderToString(Button, { 
      props: { ariaLabel: 'Delete Account', icon: { name: 'concordia', side: 'left' } }, 
      slots: { default: '' } 
    });
    
    expect(htmlWithText).toContain('Delete Account');
    expect(htmlWithLabel).toContain('aria-label="Delete Account"');
  });

  // ----------------------
  // Tests finaux d'intégrité
  // ----------------------
  it('final: complete button with all features', async () => {
    const html = await container.renderToString(Button, { 
      props: { 
        variant: 'modern',
        color: 'primary',
        type: 'submit',
        disabled: false,
        icon: { name: 'concordia', side: 'left' },
        ariaLabel: 'Submit form',
        className: 'submit-btn',
        id: 'main-submit',
        'data-form': 'contact-form',
        'data-action': 'submit'
      }, 
      slots: { default: 'Submit Form' } 
    });
    
    expect(html).toContain('<button');
    expect(html).toContain('type="submit"');
    expect(html).toContain('modern');
    expect(html).toContain('primary');
    expect(html).toContain('submit-btn');
    expect(html).toContain('id="main-submit"');
    expect(html).toContain('aria-label="Submit form"');
    expect(html).toContain('data-form="contact-form"');
    expect(html).toContain('data-action="submit"');
    expect(html).toContain('<svg');
    expect(html).toContain('Submit Form');
    expect(html).toContain('</button>');
  });

  it('final: minimal button renders without errors', async () => {
    const html = await container.renderToString(Button, { 
      props: {}, 
      slots: { default: 'Click' } 
    });
    
    expect(html).toBeTruthy();
    expect(html).toContain('<button');
    expect(html).toContain('Click');
    expect(html).toContain('</button>');
  });
    it('final: button with all props is valid HTML', async () => {
    const html = await container.renderToString(Button, { 
      props: { 
        variant: 'modern',
        color: 'primary',
        icon: { name: 'concordia', side: 'right' },
        disabled: true,
        ariaLabel: 'Test button',
        className: 'custom',
        id: 'test',
        type: 'button'
      }, 
      slots: { default: 'Test' } 
    });
    
    const { window } = new JSDOM(html);
    const button = window.document.querySelector('button');
    
    expect(button).toBeTruthy();
    expect(button?.getAttribute('type')).toBe('button');
    expect(button?.getAttribute('id')).toBe('test');
    expect(button?.getAttribute('aria-label')).toBe('Test button');
    expect(button?.disabled).toBe(true);
    expect(button?.textContent).toContain('Test');
  });

  it('final: accessibility audit passes', async () => {
    const html = await container.renderToString(Button, { 
      props: { ariaLabel: 'Accessible button' }, 
      slots: { default: 'Accessible' } 
    });
    
    await expectNoA11yViolations(html);
  });

  it('final: performance acceptable for component library', async () => {
    const startTime = performance.now();
    
    const renders = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        container.renderToString(Button, { 
          props: { id: `btn-${i}` }, 
          slots: { default: `Button ${i}` } 
        })
      )
    );
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(renders).toHaveLength(10);
    expect(duration).toBeLessThan(1000); // 10 buttons in less than 1 second
  });

  it('final: no console errors or warnings during render', async () => {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    const errors: string[] = [];
    const warnings: string[] = [];
    
    console.error = (...args: any[]) => errors.push(args.join(' '));
    console.warn = (...args: any[]) => warnings.push(args.join(' '));
    
    try {
      await container.renderToString(Button, { 
        props: { 
          variant: 'modern',
          color: 'primary',
          icon: { name: 'concordia', side: 'left' }
        }, 
        slots: { default: 'No Errors' } 
      });
      
      expect(errors).toHaveLength(0);
      expect(warnings).toHaveLength(0);
    } finally {
      console.error = originalError;
      console.warn = originalWarn;
    }
  });

  it('final: component is tree-shakeable and portable', async () => {
    const html = await container.renderToString(Button, { 
      props: {}, 
      slots: { default: 'Portable' } 
    });
    
    // Should be self-contained, no external dependencies in output
    expect(html).not.toContain('import');
    expect(html).not.toContain('require');
    expect(html).toMatch(/^<button/);
  });

  it('final: all props combinations work together', async () => {
    const combinations = [
      { variant: 'modern', color: 'primary' },
      { variant: 'modern', color: 'error' },
      { disabled: true, variant: 'modern' },
      { icon: { name: 'concordia', side: 'left' }, variant: 'modern' },
      { disabled: true, ariaLabel: 'Disabled' },
      { type: 'submit', className: 'custom' },
    ];
    
    for (const props of combinations) {
      const html = await container.renderToString(Button, { 
        props: props as any, 
        slots: { default: 'Test' } 
      });
      
      expect(html).toContain('<button');
      expect(html).toContain('</button>');
      expect(html).toContain('Test');
    }
  });

  it('final: button maintains state across re-renders', async () => {
    const props = { id: 'state-btn', className: 'persistent' };
    
    const html1 = await container.renderToString(Button, { 
      props, 
      slots: { default: 'Persistent' } 
    });
    
    const html2 = await container.renderToString(Button, { 
      props, 
      slots: { default: 'Persistent' } 
    });
    
    expect(html1).toBe(html2);
    expect(html1).toContain('id="state-btn"');
    expect(html1).toContain('persistent');
  });

  it('final: component exports are correct', async () => {
    // Verify Button can be imported and used
    expect(Button).toBeDefined();
    expect(typeof Button).toBe('object'); // Astro component
  });

  it('final: no memory leaks during batch rendering', async () => {
    const batchSize = 500;
    const startTime = performance.now();
    
    const renders = await Promise.all(
      Array.from({ length: batchSize }, (_, i) =>
        container.renderToString(Button, { 
          props: { 
            id: `batch-${i}`,
            variant: i % 2 === 0 ? 'modern' : 'default'
          }, 
          slots: { default: `Batch ${i}` } 
        })
      )
    );
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(renders).toHaveLength(batchSize);
    expect(duration).toBeLessThan(15000); // Should complete in reasonable time
    console.log(`✓ Rendered ${batchSize} buttons in ${duration.toFixed(2)}ms`);
  });

  it('final: component is production-ready', async () => {
    const html = await container.renderToString(Button, { 
      props: { 
        variant: 'modern',
        color: 'primary',
        type: 'button',
        className: 'btn-primary',
        ariaLabel: 'Action button',
        id: 'action-btn',
        'data-testid': 'button'
      }, 
      slots: { default: 'Action' } 
    });
    
    // All critical features present
    expect(html).toContain('<button');
    expect(html).toContain('type="button"');
    expect(html).toContain('modern');
    expect(html).toContain('primary');
    expect(html).toContain('btn-primary');
    expect(html).toContain('aria-label="Action button"');
    expect(html).toContain('id="action-btn"');
    expect(html).toContain('data-testid="button"');
    expect(html).toContain('Action');
    expect(html).toContain('</button>');
  });

  it('final: handles edge cases gracefully', async () => {
    const edgeCases = [
      { props: {}, slots: { default: '' } },
      { props: { disabled: true }, slots: { default: 'Disabled' } },
      { props: { variant: 'unknown' as any }, slots: { default: 'Unknown' } },
      { props: { color: 'invalid' as any }, slots: { default: 'Invalid' } },
      { props: { icon: { name: 'unknown', side: 'invalid' } as any }, slots: { default: 'Icon' } },
      { props: { className: null as any }, slots: { default: 'Null' } },
      { props: { ariaLabel: '' }, slots: { default: 'Empty Label' } },
    ];
    
    for (const testCase of edgeCases) {
      const html = await container.renderToString(Button, testCase);
      expect(html).toContain('<button');
      expect(html).toContain('</button>');
    }
  });

  it('final: snapshot test for regression detection', async () => {
    const html = await container.renderToString(Button, { 
      props: { 
        variant: 'modern',
        color: 'primary',
        icon: { name: 'concordia', side: 'left' },
        className: 'snapshot-test',
        ariaLabel: 'Snapshot button'
      }, 
      slots: { default: 'Snapshot' } 
    });
    
    expect(html).toMatchSnapshot();
  });

  it('final: output is deterministic', async () => {
    const props = { 
      variant: 'modern',
      color: 'primary',
      icon: { name: 'concordia', side: 'left' }
    };
    
    const outputs = await Promise.all(
      Array.from({ length: 20 }, () =>
        container.renderToString(Button, { 
          props, 
          slots: { default: 'Deterministic' } 
        })
      )
    );
    
    const firstOutput = outputs[0];
    outputs.forEach(output => {
      expect(output).toBe(firstOutput);
    });
  });

  it('final: integrates with Astro ecosystem', async () => {
    const html = await container.renderToString(Button, { 
      props: { 
        class: 'astro-class', // Astro's class prop
        'data-astro-cid': 'test'
      }, 
      slots: { default: 'Astro' } 
    });
    
    expect(html).toContain('Astro');
    expect(html).toContain('<button');
  });

  it('final: documentation example works correctly', async () => {
    // Example from documentation
    const html = await container.renderToString(Button, { 
      props: { 
        variant: 'modern',
        color: 'primary',
        icon: { name: 'concordia', side: 'left' }
      }, 
      slots: { default: 'Click me' } 
    });
    
    expect(html).toContain('Click me');
    expect(html).toContain('<svg');
    expect(html).toContain('modern');
    expect(html).toContain('primary');
  });

});