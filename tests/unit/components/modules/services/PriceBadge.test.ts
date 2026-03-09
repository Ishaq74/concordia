import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';

/**
 * Unit tests for PriceBadge component.
 * Mirrors the formatPrice logic from src/components/modules/services/ui/PriceBadge.astro
 */

interface PriceBadgeProps {
  basePrice?: string | null;
  priceType?: string | null;
  currency?: string | null;
  lang: string;
  variant?: 'initial' | 'retro' | 'modern' | 'futuristic';
}

// Simplified translation mock (matches getTranslations output)
const translations: Record<string, Record<string, string>> = {
  fr: {
    priceFree: 'Gratuit',
    pricePerHour: '/h',
    pricePerSession: '/séance',
    priceOnQuote: 'Sur devis',
  },
  en: {
    priceFree: 'Free',
    pricePerHour: '/hr',
    pricePerSession: '/session',
    priceOnQuote: 'On quote',
  },
};

function formatPrice(props: PriceBadgeProps): string {
  const { basePrice, priceType, currency = 'EUR', lang } = props;
  const t = translations[lang] || translations.fr;

  if (!basePrice || basePrice === '0') return t.priceFree;
  const amount = `${basePrice}\u00A0${currency}`;
  switch (priceType) {
    case 'per_hour':
      return `${amount}${t.pricePerHour}`;
    case 'per_session':
      return `${amount}${t.pricePerSession}`;
    case 'on_quote':
      return t.priceOnQuote;
    case 'fixed':
    default:
      return amount;
  }
}

function renderPriceBadge(props: PriceBadgeProps): string {
  const label = formatPrice(props);
  const color =
    !props.basePrice || props.basePrice === '0' ? 'accent' : 'primary';
  const variant = props.variant || 'initial';
  return `<span class="badge price-badge ${variant} ${color}">${label}</span>`;
}

// ── formatPrice logic ──────────────────────────────────────────

describe('PriceBadge — formatPrice logic', () => {
  it('returns "Gratuit" for null basePrice (fr)', () => {
    expect(formatPrice({ basePrice: null, lang: 'fr' })).toBe('Gratuit');
  });

  it('returns "Gratuit" for "0" basePrice (fr)', () => {
    expect(formatPrice({ basePrice: '0', lang: 'fr' })).toBe('Gratuit');
  });

  it('returns "Free" for null basePrice (en)', () => {
    expect(formatPrice({ basePrice: null, lang: 'en' })).toBe('Free');
  });

  it('returns fixed price with currency', () => {
    const result = formatPrice({ basePrice: '50', priceType: 'fixed', lang: 'fr' });
    expect(result).toContain('50');
    expect(result).toContain('EUR');
  });

  it('returns per_hour format', () => {
    const result = formatPrice({ basePrice: '30', priceType: 'per_hour', lang: 'fr' });
    expect(result).toContain('30');
    expect(result).toContain('/h');
  });

  it('returns per_session format', () => {
    const result = formatPrice({
      basePrice: '100',
      priceType: 'per_session',
      lang: 'fr',
    });
    expect(result).toContain('100');
    expect(result).toContain('/séance');
  });

  it('returns "Sur devis" for on_quote', () => {
    expect(
      formatPrice({ basePrice: '1', priceType: 'on_quote', lang: 'fr' }),
    ).toBe('Sur devis');
  });

  it('returns "On quote" for on_quote (en)', () => {
    expect(
      formatPrice({ basePrice: '1', priceType: 'on_quote', lang: 'en' }),
    ).toBe('On quote');
  });

  it('uses default currency EUR', () => {
    const result = formatPrice({ basePrice: '25', priceType: 'fixed', lang: 'fr' });
    expect(result).toContain('EUR');
  });

  it('uses custom currency', () => {
    const result = formatPrice({
      basePrice: '25',
      priceType: 'fixed',
      currency: 'USD',
      lang: 'fr',
    });
    expect(result).toContain('USD');
  });

  it('default priceType returns amount only', () => {
    const result = formatPrice({ basePrice: '75', lang: 'fr' });
    expect(result).toContain('75');
    expect(result).toContain('EUR');
    expect(result).not.toContain('/h');
    expect(result).not.toContain('/séance');
  });
});

// ── Rendering ──────────────────────────────────────────────────

describe('PriceBadge — Rendering', () => {
  it('renders badge element', () => {
    const dom = new JSDOM(
      renderPriceBadge({ basePrice: '50', lang: 'fr' }),
    );
    const badge = dom.window.document.querySelector('.badge');
    expect(badge).toBeTruthy();
  });

  it('uses accent color for free services', () => {
    const dom = new JSDOM(
      renderPriceBadge({ basePrice: null, lang: 'fr' }),
    );
    const badge = dom.window.document.querySelector('.badge');
    expect(badge!.classList.contains('accent')).toBe(true);
  });

  it('uses primary color for paid services', () => {
    const dom = new JSDOM(
      renderPriceBadge({ basePrice: '50', lang: 'fr' }),
    );
    const badge = dom.window.document.querySelector('.badge');
    expect(badge!.classList.contains('primary')).toBe(true);
  });

  it('applies variant class', () => {
    for (const variant of ['retro', 'modern', 'futuristic'] as const) {
      const dom = new JSDOM(
        renderPriceBadge({ basePrice: '50', lang: 'fr', variant }),
      );
      const badge = dom.window.document.querySelector('.badge');
      expect(badge!.classList.contains(variant)).toBe(true);
    }
  });

  it('displays formatted price text', () => {
    const dom = new JSDOM(
      renderPriceBadge({ basePrice: '99', priceType: 'per_hour', lang: 'fr' }),
    );
    const badge = dom.window.document.querySelector('.badge');
    expect(badge!.textContent).toContain('99');
    expect(badge!.textContent).toContain('/h');
  });
});
