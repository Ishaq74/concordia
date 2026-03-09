import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';

/**
 * Unit tests for ServiceMeta component.
 * Mirrors src/components/modules/services/ui/ServiceMeta.astro
 */

interface ServiceMetaProps {
  durationMinutes?: number | null;
  isMobile?: boolean;
  maxParticipants?: number | null;
  lang: string;
  className?: string;
}

function renderServiceMeta(props: ServiceMetaProps): string {
  const {
    durationMinutes,
    isMobile = false,
    maxParticipants,
    className = '',
  } = props;

  const items: string[] = [];

  if (durationMinutes) {
    items.push(
      `<span class="meta-item" title="Durée"><svg class="icon" width="16" height="16"></svg>${durationMinutes} min</span>`,
    );
  }

  if (isMobile) {
    items.push(
      `<span class="meta-item meta-mobile" title="Se déplace"><svg class="icon" width="16" height="16"></svg>Se déplace</span>`,
    );
  }

  if (maxParticipants) {
    items.push(
      `<span class="meta-item" title="Participants max"><svg class="icon" width="16" height="16"></svg>${maxParticipants}</span>`,
    );
  }

  return `<div class="service-meta ${className}">${items.join('')}</div>`;
}

describe('ServiceMeta — Duration', () => {
  it('shows duration when durationMinutes provided', () => {
    const dom = new JSDOM(
      renderServiceMeta({ durationMinutes: 60, lang: 'fr' }),
    );
    const item = dom.window.document.querySelector('.meta-item');
    expect(item).toBeTruthy();
    expect(item!.textContent).toContain('60');
    expect(item!.textContent).toContain('min');
  });

  it('hides duration when null', () => {
    const dom = new JSDOM(
      renderServiceMeta({ durationMinutes: null, lang: 'fr' }),
    );
    const items = dom.window.document.querySelectorAll('.meta-item');
    expect(items.length).toBe(0);
  });

  it('hides duration when 0', () => {
    const dom = new JSDOM(
      renderServiceMeta({ durationMinutes: 0, lang: 'fr' }),
    );
    const items = dom.window.document.querySelectorAll('.meta-item');
    expect(items.length).toBe(0);
  });
});

describe('ServiceMeta — Mobile indicator', () => {
  it('shows mobile badge when isMobile=true', () => {
    const dom = new JSDOM(
      renderServiceMeta({ isMobile: true, lang: 'fr' }),
    );
    const mobile = dom.window.document.querySelector('.meta-mobile');
    expect(mobile).toBeTruthy();
    expect(mobile!.textContent).toContain('Se déplace');
  });

  it('hides mobile badge when isMobile=false', () => {
    const dom = new JSDOM(
      renderServiceMeta({ isMobile: false, lang: 'fr' }),
    );
    const mobile = dom.window.document.querySelector('.meta-mobile');
    expect(mobile).toBeNull();
  });
});

describe('ServiceMeta — Participants', () => {
  it('shows max participants when provided', () => {
    const dom = new JSDOM(
      renderServiceMeta({ maxParticipants: 12, lang: 'fr' }),
    );
    const items = dom.window.document.querySelectorAll('.meta-item');
    expect(items.length).toBe(1);
    expect(items[0]!.textContent).toContain('12');
  });

  it('hides participants when null', () => {
    const dom = new JSDOM(
      renderServiceMeta({ maxParticipants: null, lang: 'fr' }),
    );
    const items = dom.window.document.querySelectorAll('.meta-item');
    expect(items.length).toBe(0);
  });
});

describe('ServiceMeta — Combined display', () => {
  it('shows all meta when all props provided', () => {
    const dom = new JSDOM(
      renderServiceMeta({
        durationMinutes: 90,
        isMobile: true,
        maxParticipants: 8,
        lang: 'fr',
      }),
    );
    const items = dom.window.document.querySelectorAll('.meta-item');
    expect(items.length).toBe(3);
  });

  it('shows nothing when no optional props', () => {
    const dom = new JSDOM(renderServiceMeta({ lang: 'fr' }));
    const items = dom.window.document.querySelectorAll('.meta-item');
    expect(items.length).toBe(0);
  });

  it('applies custom className', () => {
    const dom = new JSDOM(
      renderServiceMeta({ lang: 'fr', className: 'compact-meta' }),
    );
    const container = dom.window.document.querySelector('.service-meta');
    expect(container!.classList.contains('compact-meta')).toBe(true);
  });
});
