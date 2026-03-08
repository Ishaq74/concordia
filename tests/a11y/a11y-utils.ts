import type { Page } from '@playwright/test';

export async function runAxe(page: Page) {
  const AxeBuilder = (await import('@axe-core/playwright')).AxeBuilder;
  const results = await new AxeBuilder({ page }).analyze();
  return results;
}

export async function runLighthouse(url: string) {
  // Dynamic import to avoid hard dependency in envs without chrome
  try {
    const lighthouse = (await import('lighthouse')).default;
    const chromeLauncher = await import('chrome-launcher');
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox'] });
    const result = await lighthouse(url, {
      port: chrome.port,
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    });
    await chrome.kill();
    const categories = result?.lhr?.categories ?? {};
    return {
      performance: Math.round((categories.performance?.score ?? 0) * 100),
      accessibility: Math.round((categories.accessibility?.score ?? 0) * 100),
      bestPractices: Math.round((categories['best-practices']?.score ?? 0) * 100),
      seo: Math.round((categories.seo?.score ?? 0) * 100),
    };
  } catch (err) {
    console.warn('Lighthouse unavailable:', (err as Error).message);
    return { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 };
  }
}
