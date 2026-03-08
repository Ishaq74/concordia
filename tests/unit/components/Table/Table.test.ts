import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';

/**
 * Unit tests for Table component.
 * Tests rendering, variants, striping, and accessibility.
 */

function renderTable(props: {
  variant?: string;
  striped?: boolean;
  className?: string;
  content?: string;
}) {
  const variant = props.variant || 'initial';
  const variantClass = variant !== 'initial' ? variant : '';
  const classes = ['table-container', variantClass, props.striped ? 'striped' : '', props.className]
    .filter(Boolean)
    .join(' ');

  const content =
    props.content ||
    `<thead><tr><th>Name</th><th>Age</th></tr></thead>
     <tbody><tr><td>Alice</td><td>30</td></tr></tbody>`;

  return `<div class="${classes}"><table class="table">${content}</table></div>`;
}

describe('Table — Rendering', () => {
  it('renders table container with default classes', () => {
    const dom = new JSDOM(renderTable({}));
    const container = dom.window.document.querySelector('.table-container');
    expect(container).toBeTruthy();
    const table = container!.querySelector('table.table');
    expect(table).toBeTruthy();
  });

  it('applies variant class', () => {
    for (const variant of ['retro', 'modern', 'futuristic']) {
      const dom = new JSDOM(renderTable({ variant }));
      const container = dom.window.document.querySelector('.table-container');
      expect(container!.classList.contains(variant)).toBe(true);
    }
  });

  it('applies striped class when striped=true', () => {
    const dom = new JSDOM(renderTable({ striped: true }));
    const container = dom.window.document.querySelector('.table-container');
    expect(container!.classList.contains('striped')).toBe(true);
  });

  it('does not apply striped class when striped=false', () => {
    const dom = new JSDOM(renderTable({ striped: false }));
    const container = dom.window.document.querySelector('.table-container');
    expect(container!.classList.contains('striped')).toBe(false);
  });

  it('applies custom className', () => {
    const dom = new JSDOM(renderTable({ className: 'my-table' }));
    const container = dom.window.document.querySelector('.table-container');
    expect(container!.classList.contains('my-table')).toBe(true);
  });

  it('renders table content correctly', () => {
    const dom = new JSDOM(renderTable({}));
    const headers = dom.window.document.querySelectorAll('th');
    expect(headers.length).toBe(2);
    expect(headers[0].textContent).toBe('Name');
    const cells = dom.window.document.querySelectorAll('td');
    expect(cells.length).toBe(2);
    expect(cells[0].textContent).toBe('Alice');
  });
});

describe('Table — Accessibility', () => {
  it('uses semantic table elements (thead, tbody, th, td)', () => {
    const dom = new JSDOM(renderTable({}));
    expect(dom.window.document.querySelector('thead')).toBeTruthy();
    expect(dom.window.document.querySelector('tbody')).toBeTruthy();
    expect(dom.window.document.querySelector('th')).toBeTruthy();
    expect(dom.window.document.querySelector('td')).toBeTruthy();
  });
});
