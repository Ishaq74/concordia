import { describe, it, expect } from 'vitest';
import { renderSSR } from './ssr-utils';

// SSR rendering tests — requires a running dev server at TEST_BASE_URL (default http://localhost:4321)

describe('SSR rendering', () => {
  it('renders homepage for all locales', async () => {
    const locales = ['fr', 'en', 'ar', 'es'];
    for (const locale of locales) {
      const result = await renderSSR(`/${locale}/`);
      expect(result.html).toContain('<html');
      expect(result.status).toBe(200);
    }
  });

  it('returns 404 for unknown routes', async () => {
    const result = await renderSSR('/fr/unknown-page-that-does-not-exist');
    expect(result.status).toBe(404);
  });
});

// Hydration and server-error tests are placeholder — they require instrumentation
// that is not yet implemented. See ssr-utils.ts for details.
// TODO: Implement real hydration metrics (e.g. via Playwright or a custom Vite plugin)
// TODO: Implement server error simulation (e.g. via a test route that throws)
