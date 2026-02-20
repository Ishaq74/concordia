import { AxeBuilder } from '@axe-core/playwright';
import { launchLighthouse } from '@tests/utils/api-helpers';

export async function runAxe(page) {
  const results = await new AxeBuilder({ page }).analyze();
  return results;
}

export async function runLighthouse(url: string) {
  const report = await launchLighthouse(url);
  return {
    performance: report.categories.performance.score * 100,
    accessibility: report.categories.accessibility.score * 100,
  };
}
