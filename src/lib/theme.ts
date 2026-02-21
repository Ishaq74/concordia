export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const COOKIE_KEY = 'theme';

function safeGetStorage(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function safeSetStorage(value: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // silently fail; fallback will use cookie instead
    setCookie(value);
  }
}

function setCookie(value: string) {
  try {
    // 1 year
    document.cookie = `${COOKIE_KEY}=${value};path=/;max-age=31536000`;
  } catch {
    // ignore
  }
}

function getCookie(): string | null {
  try {
    const match = document.cookie.match('(^|;)\\s*' + COOKIE_KEY + '=([^;]+)');
    return match ? match[2] : null;
  } catch {
    return null;
  }
}

export function readStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  const stored = safeGetStorage() || getCookie();
  if (stored === 'dark' || stored === 'light') return stored;
  return null;
}

export function writeStoredTheme(theme: Theme) {
  if (typeof window === 'undefined') return;
  safeSetStorage(theme);
  // also update cookie so environments that don't respect localStorage still work
  setCookie(theme);
}

export function prefersDark(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

export function getTheme(): Theme {
  const stored = readStoredTheme();
  if (stored) return stored;
  return prefersDark() ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
}

function dispatchThemeChange(theme: Theme) {
  if (typeof document === 'undefined') return;
  const ev = new CustomEvent('themechange', { detail: { theme } });
  document.dispatchEvent(ev);
}

export function setTheme(theme: Theme) {
  applyTheme(theme);
  writeStoredTheme(theme);
  dispatchThemeChange(theme);
}

export function toggleTheme() {
  if (typeof document === 'undefined') return;
  const current = (document.documentElement.getAttribute('data-theme') as Theme) || 'light';
  setTheme(current === 'dark' ? 'light' : 'dark');
}

export function initTheme() {
  setTheme(getTheme());
}
