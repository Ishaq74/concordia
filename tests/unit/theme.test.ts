import { describe, it, expect, beforeEach } from 'vitest';
import * as theme from '@/lib/theme';

describe('theme utility', () => {
  // helper to temporarily replace window properties
  const originalLocation = globalThis.location;

  beforeEach(() => {
    // reset cookie and localStorage
    document.cookie = '';
    try {
      window.localStorage.clear();
    } catch {
      // ignore
    }
    // reset data-theme
    document.documentElement.removeAttribute('data-theme');
  });

  it('getTheme prefers stored value over media', () => {
    // stub matchMedia
    (window as any).matchMedia = () => ({ matches: true });

    localStorage.setItem('theme', 'light');
    expect(theme.getTheme()).toBe('light');
    localStorage.setItem('theme', 'dark');
    expect(theme.getTheme()).toBe('dark');
  });

  it('getTheme falls back to cookie when localStorage throws', () => {
    // make localStorage throw on get
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('blocked');
      }
    });
    document.cookie = 'theme=dark';
    expect(theme.getTheme()).toBe('dark');
  });

  it('getTheme defaults to prefers-color-scheme when nothing stored', () => {
    (window as any).matchMedia = () => ({ matches: true });
    expect(theme.getTheme()).toBe('dark');
    (window as any).matchMedia = () => ({ matches: false });
    expect(theme.getTheme()).toBe('light');
  });

  it('setTheme applies attribute and persists', () => {
    theme.setTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    // also stored
    expect(localStorage.getItem('theme')).toBe('dark');
    // toggling
    theme.toggleTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('initTheme writes initial attribute', () => {
    localStorage.setItem('theme', 'light');
    theme.initTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('dispatches themechange event when set', () => {
    let received: any = null;
    document.addEventListener('themechange', (e: any) => {
      received = e.detail;
    });
    theme.setTheme('dark');
    expect(received).toEqual({ theme: 'dark' });
  });
});
