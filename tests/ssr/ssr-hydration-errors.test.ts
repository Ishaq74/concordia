import { describe, it, expect } from 'vitest';
import { renderSSR, simulateHydration, simulateServerError } from './ssr-utils';

// SSR rendering tests

describe('SSR rendering', () => {
  it('renders all pages correctly on server', async () => {
    const pages = ['/', '/fr/', '/en/', '/ar/', '/es/'];
    for (const page of pages) {
      const result = await renderSSR(page);
      expect(result.html).toContain('<html');
      expect(result.status).toBe(200);
      expect(result.html).toMatch(/<main[\s\S]*?>/);
    }
  });

  it('renders with all variants and locales', async () => {
    const variants = ['initial', 'retro', 'modern', 'futuristic'];
    const locales = ['fr', 'en', 'ar', 'es'];
    for (const variant of variants) {
      for (const locale of locales) {
        const result = await renderSSR(`/${locale}/?variant=${variant}`);
        expect(result.html).toContain(`variant-${variant}`);
        expect(result.html).toContain(`lang="${locale}"`);
      }
    }
  });
});

// Hydration tests

describe('Hydration', () => {
  it('hydrates interactive islands only', async () => {
    const result = await simulateHydration('/fr/');
    expect(result.clientJs).toBeLessThan(20 * 1024); // <20KB client JS
    expect(result.hydratedIslands).toContain('SignInCard');
    expect(result.hydratedIslands).not.toContain('MainDoc');
  });
});

// Server error tests

describe('Server errors', () => {
  it('returns 500 for uncaught exceptions', async () => {
    const result = await simulateServerError('/fr/');
    expect(result.status).toBe(500);
    expect(result.html).toContain('Erreur serveur');
  });

  it('returns 404 for unknown routes', async () => {
    const result = await renderSSR('/fr/unknown-page');
    expect(result.status).toBe(404);
    expect(result.html).toContain('Page non trouvée');
  });
});
