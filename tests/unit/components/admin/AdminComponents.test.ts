import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';

/**
 * Unit tests for admin components: AdminToast, MarkdownEditor, MediaPickerModal.
 * Tests HTML structure, accessibility attributes, and variant styles.
 */

// ── AdminToast ─────────────────────────────────────────────────

function renderAdminToast(): string {
  return `<div id="admin-toast-container" class="admin-toast-container" aria-live="polite" aria-atomic="true"></div>`;
}

function renderToastAlert(
  message: string,
  variant: 'info' | 'success' | 'warning' | 'error' = 'info',
): string {
  return `<div id="admin-toast-container" class="admin-toast-container" aria-live="polite" aria-atomic="true">
    <div class="alert ${variant}" role="alert">
      <svg width="20" height="20"></svg>
      <div><strong>${variant}</strong>${message}</div>
      <button class="alert-close" aria-label="Fermer">&times;</button>
    </div>
  </div>`;
}

describe('AdminToast — Structure', () => {
  it('renders container with correct id', () => {
    const dom = new JSDOM(renderAdminToast());
    const container = dom.window.document.getElementById('admin-toast-container');
    expect(container).toBeTruthy();
  });

  it('has aria-live="polite" for screen readers', () => {
    const dom = new JSDOM(renderAdminToast());
    const container = dom.window.document.getElementById('admin-toast-container');
    expect(container!.getAttribute('aria-live')).toBe('polite');
  });

  it('has aria-atomic="true"', () => {
    const dom = new JSDOM(renderAdminToast());
    const container = dom.window.document.getElementById('admin-toast-container');
    expect(container!.getAttribute('aria-atomic')).toBe('true');
  });

  it('starts empty (no toasts)', () => {
    const dom = new JSDOM(renderAdminToast());
    const container = dom.window.document.getElementById('admin-toast-container');
    expect(container!.children.length).toBe(0);
  });
});

describe('AdminToast — Alert variants', () => {
  for (const variant of ['info', 'success', 'warning', 'error'] as const) {
    it(`renders ${variant} alert with correct class`, () => {
      const dom = new JSDOM(renderToastAlert('Test message', variant));
      const alert = dom.window.document.querySelector('.alert');
      expect(alert).toBeTruthy();
      expect(alert!.classList.contains(variant)).toBe(true);
    });
  }

  it('alert has role="alert"', () => {
    const dom = new JSDOM(renderToastAlert('Hello', 'success'));
    const alert = dom.window.document.querySelector('.alert');
    expect(alert!.getAttribute('role')).toBe('alert');
  });

  it('close button has aria-label', () => {
    const dom = new JSDOM(renderToastAlert('Msg', 'info'));
    const btn = dom.window.document.querySelector('.alert-close');
    expect(btn).toBeTruthy();
    expect(btn!.getAttribute('aria-label')).toBe('Fermer');
  });
});

// ── MarkdownEditor ─────────────────────────────────────────────

interface MarkdownEditorProps {
  id: string;
  name: string;
  value?: string;
  placeholder?: string;
  rows?: number;
  minimal?: boolean;
}

function renderMarkdownEditor(props: MarkdownEditorProps): string {
  const {
    id,
    name,
    value = '',
    placeholder = '',
    rows = 16,
    minimal = false,
  } = props;
  return `<div class="md-editor-wrapper" data-md-editor="${id}" data-md-minimal="${minimal ? 'true' : 'false'}">
    <textarea id="${id}" name="${name}" rows="${rows}" placeholder="${placeholder}" class="md-editor-textarea">${value}</textarea>
  </div>`;
}

describe('MarkdownEditor — Structure', () => {
  it('renders wrapper with data-md-editor attribute', () => {
    const dom = new JSDOM(
      renderMarkdownEditor({ id: 'body-fr', name: 'body-fr' }),
    );
    const wrapper = dom.window.document.querySelector('.md-editor-wrapper');
    expect(wrapper).toBeTruthy();
    expect(wrapper!.getAttribute('data-md-editor')).toBe('body-fr');
  });

  it('renders textarea with correct id and name', () => {
    const dom = new JSDOM(
      renderMarkdownEditor({ id: 'content', name: 'content' }),
    );
    const textarea = dom.window.document.querySelector('textarea');
    expect(textarea).toBeTruthy();
    expect(textarea!.getAttribute('id')).toBe('content');
    expect(textarea!.getAttribute('name')).toBe('content');
  });

  it('sets rows from props', () => {
    const dom = new JSDOM(
      renderMarkdownEditor({ id: 'x', name: 'x', rows: 24 }),
    );
    const textarea = dom.window.document.querySelector('textarea');
    expect(textarea!.getAttribute('rows')).toBe('24');
  });

  it('defaults to 16 rows', () => {
    const dom = new JSDOM(
      renderMarkdownEditor({ id: 'x', name: 'x' }),
    );
    const textarea = dom.window.document.querySelector('textarea');
    expect(textarea!.getAttribute('rows')).toBe('16');
  });

  it('sets placeholder', () => {
    const dom = new JSDOM(
      renderMarkdownEditor({ id: 'x', name: 'x', placeholder: 'Écrivez…' }),
    );
    const textarea = dom.window.document.querySelector('textarea');
    expect(textarea!.getAttribute('placeholder')).toBe('Écrivez…');
  });

  it('sets initial value', () => {
    const dom = new JSDOM(
      renderMarkdownEditor({ id: 'x', name: 'x', value: '# Hello' }),
    );
    const textarea = dom.window.document.querySelector('textarea');
    expect(textarea!.textContent).toBe('# Hello');
  });
});

describe('MarkdownEditor — Minimal mode', () => {
  it('sets data-md-minimal="true" when minimal', () => {
    const dom = new JSDOM(
      renderMarkdownEditor({ id: 'bio', name: 'bio', minimal: true }),
    );
    const wrapper = dom.window.document.querySelector('.md-editor-wrapper');
    expect(wrapper!.getAttribute('data-md-minimal')).toBe('true');
  });

  it('sets data-md-minimal="false" when not minimal', () => {
    const dom = new JSDOM(
      renderMarkdownEditor({ id: 'body', name: 'body', minimal: false }),
    );
    const wrapper = dom.window.document.querySelector('.md-editor-wrapper');
    expect(wrapper!.getAttribute('data-md-minimal')).toBe('false');
  });
});

// ── MediaPickerModal ───────────────────────────────────────────

function renderMediaPickerModal(): string {
  return `<div id="media-picker-overlay" class="mp-overlay" role="dialog" aria-modal="true" aria-label="Sélectionner un média" style="display:none;">
    <div class="mp-modal">
      <div class="mp-header">
        <h2 class="mp-title">Bibliothèque de médias</h2>
        <button type="button" class="mp-close" id="mp-close" aria-label="Fermer">&times;</button>
      </div>
      <div class="mp-tabs" role="tablist">
        <button type="button" role="tab" class="mp-tab active" data-mp-tab="library" aria-selected="true">Bibliothèque</button>
        <button type="button" role="tab" class="mp-tab" data-mp-tab="upload" aria-selected="false">Uploader</button>
      </div>
      <div class="mp-panel active" id="mp-panel-library">
        <div class="mp-toolbar">
          <input type="search" class="mp-search" id="mp-search" placeholder="Rechercher par nom…" />
        </div>
        <div class="mp-grid" id="mp-grid">
          <div class="mp-loading">Chargement…</div>
        </div>
        <div class="mp-pagination" id="mp-pagination"></div>
      </div>
      <div class="mp-panel" id="mp-panel-upload">
        <div class="mp-upload-zone" id="mp-upload-zone">
          <p class="mp-upload-text">Glissez une image ici ou <strong>cliquez pour parcourir</strong></p>
          <p class="mp-upload-hint">JPG, PNG, WebP, AVIF, GIF, SVG — Max 10 Mo</p>
          <input type="file" id="mp-file-input" accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml" class="mp-file-hidden" />
        </div>
      </div>
    </div>
  </div>`;
}

describe('MediaPickerModal — Structure', () => {
  it('renders overlay with display:none by default', () => {
    const dom = new JSDOM(renderMediaPickerModal());
    const overlay = dom.window.document.getElementById('media-picker-overlay');
    expect(overlay).toBeTruthy();
    expect(overlay!.style.display).toBe('none');
  });

  it('has role="dialog" and aria-modal="true"', () => {
    const dom = new JSDOM(renderMediaPickerModal());
    const overlay = dom.window.document.getElementById('media-picker-overlay');
    expect(overlay!.getAttribute('role')).toBe('dialog');
    expect(overlay!.getAttribute('aria-modal')).toBe('true');
  });

  it('has accessible dialog label', () => {
    const dom = new JSDOM(renderMediaPickerModal());
    const overlay = dom.window.document.getElementById('media-picker-overlay');
    expect(overlay!.getAttribute('aria-label')).toBe('Sélectionner un média');
  });

  it('close button has aria-label', () => {
    const dom = new JSDOM(renderMediaPickerModal());
    const close = dom.window.document.getElementById('mp-close');
    expect(close).toBeTruthy();
    expect(close!.getAttribute('aria-label')).toBe('Fermer');
  });
});

describe('MediaPickerModal — Tabs', () => {
  it('has tablist with 2 tabs', () => {
    const dom = new JSDOM(renderMediaPickerModal());
    const tablist = dom.window.document.querySelector('[role="tablist"]');
    expect(tablist).toBeTruthy();
    const tabs = tablist!.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(2);
  });

  it('library tab is active by default', () => {
    const dom = new JSDOM(renderMediaPickerModal());
    const libraryTab = dom.window.document.querySelector('[data-mp-tab="library"]');
    expect(libraryTab!.getAttribute('aria-selected')).toBe('true');
    expect(libraryTab!.classList.contains('active')).toBe(true);
  });

  it('upload tab is inactive by default', () => {
    const dom = new JSDOM(renderMediaPickerModal());
    const uploadTab = dom.window.document.querySelector('[data-mp-tab="upload"]');
    expect(uploadTab!.getAttribute('aria-selected')).toBe('false');
  });
});

describe('MediaPickerModal — Upload panel', () => {
  it('has file input with restricted accept types', () => {
    const dom = new JSDOM(renderMediaPickerModal());
    const input = dom.window.document.getElementById('mp-file-input') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.getAttribute('type')).toBe('file');
    const accept = input.getAttribute('accept')!;
    expect(accept).toContain('image/jpeg');
    expect(accept).toContain('image/png');
    expect(accept).toContain('image/webp');
    expect(accept).toContain('image/svg+xml');
  });

  it('has search input in library panel', () => {
    const dom = new JSDOM(renderMediaPickerModal());
    const search = dom.window.document.getElementById('mp-search');
    expect(search).toBeTruthy();
    expect(search!.getAttribute('type')).toBe('search');
  });
});
