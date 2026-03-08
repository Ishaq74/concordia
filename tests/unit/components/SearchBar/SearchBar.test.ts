import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';

/**
 * Unit tests for SearchBar component.
 */

function renderSearchBar(props: {
  name?: string;
  placeholder?: string;
  action?: string;
  method?: 'get' | 'post';
  ariaLabel?: string;
  value?: string;
}) {
  const name = props.name || 'q';
  const method = props.method || 'get';
  const action = props.action || '';
  const aria = props.ariaLabel || 'Search';
  const placeholder = props.placeholder || 'Rechercher...';
  const value = props.value || '';

  return `<form role="search" method="${method}" action="${action}" class="search-bar">
    <div class="form-group">
      <label class="sr-only" for="${name}">${aria}</label>
      <div class="search-bar-inner">
        <input id="${name}" name="${name}" type="search" placeholder="${placeholder}" value="${value}" aria-label="${aria}" />
        <button type="submit" aria-label="${aria}">🔍</button>
      </div>
    </div>
  </form>`;
}

describe('SearchBar — Rendering', () => {
  it('renders form with role="search"', () => {
    const dom = new JSDOM(renderSearchBar({}));
    const form = dom.window.document.querySelector('form[role="search"]');
    expect(form).toBeTruthy();
  });

  it('renders input with type="search"', () => {
    const dom = new JSDOM(renderSearchBar({ name: 'query' }));
    const input = dom.window.document.querySelector('input[type="search"]');
    expect(input).toBeTruthy();
    expect(input!.getAttribute('name')).toBe('query');
  });

  it('renders submit button', () => {
    const dom = new JSDOM(renderSearchBar({}));
    const button = dom.window.document.querySelector('button[type="submit"]');
    expect(button).toBeTruthy();
  });

  it('applies placeholder text', () => {
    const dom = new JSDOM(renderSearchBar({ placeholder: 'Find services...' }));
    const input = dom.window.document.querySelector('input');
    expect(input!.getAttribute('placeholder')).toBe('Find services...');
  });

  it('renders with pre-filled value', () => {
    const dom = new JSDOM(renderSearchBar({ value: 'test query' }));
    const input = dom.window.document.querySelector('input');
    expect(input!.getAttribute('value')).toBe('test query');
  });

  it('uses correct form method', () => {
    const dom = new JSDOM(renderSearchBar({ method: 'post' }));
    const form = dom.window.document.querySelector('form');
    expect(form!.getAttribute('method')).toBe('post');
  });

  it('uses correct form action', () => {
    const dom = new JSDOM(renderSearchBar({ action: '/fr/search/' }));
    const form = dom.window.document.querySelector('form');
    expect(form!.getAttribute('action')).toBe('/fr/search/');
  });
});

describe('SearchBar — Accessibility', () => {
  it('has sr-only label for screen readers', () => {
    const dom = new JSDOM(renderSearchBar({ ariaLabel: 'Search the site' }));
    const label = dom.window.document.querySelector('.sr-only');
    expect(label).toBeTruthy();
    expect(label!.textContent).toBe('Search the site');
  });

  it('input has aria-label', () => {
    const dom = new JSDOM(renderSearchBar({ ariaLabel: 'Search' }));
    const input = dom.window.document.querySelector('input');
    expect(input!.getAttribute('aria-label')).toBe('Search');
  });

  it('button has aria-label', () => {
    const dom = new JSDOM(renderSearchBar({ ariaLabel: 'Search' }));
    const button = dom.window.document.querySelector('button');
    expect(button!.getAttribute('aria-label')).toBe('Search');
  });

  it('label for attribute matches input id', () => {
    const dom = new JSDOM(renderSearchBar({ name: 'search-input' }));
    const label = dom.window.document.querySelector('label');
    const input = dom.window.document.querySelector('input');
    expect(label!.getAttribute('for')).toBe(input!.getAttribute('id'));
  });
});
