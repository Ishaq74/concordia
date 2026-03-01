import type { Page } from '@playwright/test';

export async function runAxe(page: Page) {
  const AxeBuilder = (await import('@axe-core/playwright')).AxeBuilder;
  const results = await new AxeBuilder({ page }).analyze();
  return results;
}

export async function runLighthouse(_url: string) {
  // Lighthouse integration is optional — return empty scores when not configured
  return {
    performance: 0,
    accessibility: 0,
  };
}
