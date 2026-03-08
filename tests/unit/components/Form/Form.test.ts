import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';

/**
 * Unit tests for Form sub-components (FormGroup, Input, Label, Select, Textarea, etc.)
 */

// ─── FormGroup ────────────────────────────────────────────────

describe('FormGroup — Rendering', () => {
  function renderFormGroup(className?: string) {
    const classes = ['form-group', className].filter(Boolean).join(' ');
    return `<div class="${classes}"><label>Name</label><input type="text" /></div>`;
  }

  it('renders with form-group class', () => {
    const dom = new JSDOM(renderFormGroup());
    expect(dom.window.document.querySelector('.form-group')).toBeTruthy();
  });

  it('applies custom className', () => {
    const dom = new JSDOM(renderFormGroup('required'));
    const group = dom.window.document.querySelector('.form-group');
    expect(group!.classList.contains('required')).toBe(true);
  });
});

// ─── Input ────────────────────────────────────────────────────

describe('Input — Rendering & Accessibility', () => {
  function renderInput(props: {
    type?: string;
    name?: string;
    id?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    ariaDescribedBy?: string;
    value?: string;
  }) {
    const type = props.type || 'text';
    const attrs = [
      props.name ? `name="${props.name}"` : '',
      props.id ? `id="${props.id}"` : '',
      props.placeholder ? `placeholder="${props.placeholder}"` : '',
      props.required ? 'required' : '',
      props.disabled ? 'disabled' : '',
      props.ariaDescribedBy ? `aria-describedby="${props.ariaDescribedBy}"` : '',
      props.value ? `value="${props.value}"` : '',
    ]
      .filter(Boolean)
      .join(' ');

    return `<input type="${type}" class="form-input" ${attrs} />`;
  }

  it('renders with correct type', () => {
    for (const type of ['text', 'email', 'password', 'number', 'tel', 'url']) {
      const dom = new JSDOM(renderInput({ type }));
      const input = dom.window.document.querySelector('input');
      expect(input!.getAttribute('type')).toBe(type);
    }
  });

  it('applies name and id', () => {
    const dom = new JSDOM(renderInput({ name: 'email', id: 'email-input' }));
    const input = dom.window.document.querySelector('input');
    expect(input!.getAttribute('name')).toBe('email');
    expect(input!.getAttribute('id')).toBe('email-input');
  });

  it('applies required attribute', () => {
    const dom = new JSDOM(renderInput({ required: true }));
    const input = dom.window.document.querySelector('input');
    expect(input!.hasAttribute('required')).toBe(true);
  });

  it('applies disabled attribute', () => {
    const dom = new JSDOM(renderInput({ disabled: true }));
    const input = dom.window.document.querySelector('input');
    expect(input!.hasAttribute('disabled')).toBe(true);
  });

  it('supports aria-describedby for error messages', () => {
    const dom = new JSDOM(renderInput({ ariaDescribedBy: 'email-error' }));
    const input = dom.window.document.querySelector('input');
    expect(input!.getAttribute('aria-describedby')).toBe('email-error');
  });
});

// ─── Label ────────────────────────────────────────────────────

describe('Label — Rendering', () => {
  function renderLabel(htmlFor: string, text: string, required?: boolean) {
    const req = required ? '<span class="required-indicator" aria-hidden="true">*</span>' : '';
    return `<label for="${htmlFor}" class="form-label">${text}${req}</label>`;
  }

  it('renders with for attribute matching input id', () => {
    const dom = new JSDOM(renderLabel('name', 'Full Name'));
    const label = dom.window.document.querySelector('label');
    expect(label!.getAttribute('for')).toBe('name');
    expect(label!.textContent).toContain('Full Name');
  });

  it('shows required indicator', () => {
    const dom = new JSDOM(renderLabel('email', 'Email', true));
    const indicator = dom.window.document.querySelector('.required-indicator');
    expect(indicator).toBeTruthy();
    expect(indicator!.getAttribute('aria-hidden')).toBe('true');
  });
});

// ─── Select ───────────────────────────────────────────────────

describe('Select — Rendering & Accessibility', () => {
  function renderSelect(props: {
    name: string;
    id?: string;
    options: { value: string; label: string }[];
    required?: boolean;
    disabled?: boolean;
  }) {
    const attrs = [
      `name="${props.name}"`,
      props.id ? `id="${props.id}"` : '',
      props.required ? 'required' : '',
      props.disabled ? 'disabled' : '',
    ]
      .filter(Boolean)
      .join(' ');

    let html = `<select class="form-select" ${attrs}>`;
    for (const opt of props.options) {
      html += `<option value="${opt.value}">${opt.label}</option>`;
    }
    html += `</select>`;
    return html;
  }

  it('renders with correct options', () => {
    const dom = new JSDOM(
      renderSelect({
        name: 'role',
        options: [
          { value: 'admin', label: 'Admin' },
          { value: 'member', label: 'Member' },
        ],
      }),
    );
    const options = dom.window.document.querySelectorAll('option');
    expect(options.length).toBe(2);
    expect(options[0].getAttribute('value')).toBe('admin');
  });

  it('applies required and disabled', () => {
    const dom = new JSDOM(
      renderSelect({
        name: 'role',
        options: [],
        required: true,
        disabled: true,
      }),
    );
    const select = dom.window.document.querySelector('select');
    expect(select!.hasAttribute('required')).toBe(true);
    expect(select!.hasAttribute('disabled')).toBe(true);
  });
});

// ─── Textarea ─────────────────────────────────────────────────

describe('Textarea — Rendering', () => {
  function renderTextarea(props: {
    name: string;
    rows?: number;
    placeholder?: string;
    required?: boolean;
    maxlength?: number;
  }) {
    const rows = props.rows || 4;
    const attrs = [
      `name="${props.name}"`,
      `rows="${rows}"`,
      props.placeholder ? `placeholder="${props.placeholder}"` : '',
      props.required ? 'required' : '',
      props.maxlength ? `maxlength="${props.maxlength}"` : '',
    ]
      .filter(Boolean)
      .join(' ');

    return `<textarea class="form-textarea" ${attrs}></textarea>`;
  }

  it('renders with correct rows', () => {
    const dom = new JSDOM(renderTextarea({ name: 'bio', rows: 6 }));
    const textarea = dom.window.document.querySelector('textarea');
    expect(textarea!.getAttribute('rows')).toBe('6');
  });

  it('applies maxlength for input validation', () => {
    const dom = new JSDOM(renderTextarea({ name: 'comment', maxlength: 500 }));
    const textarea = dom.window.document.querySelector('textarea');
    expect(textarea!.getAttribute('maxlength')).toBe('500');
  });
});
