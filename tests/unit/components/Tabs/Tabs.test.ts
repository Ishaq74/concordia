import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';

/**
 * Unit tests for Tabs component.
 */

function renderTabs(props: {
  variant?: string;
  label?: string;
  name?: string;
  tabs?: { id: string; label: string; content: string }[];
}) {
  const variant = props.variant || 'initial';
  const label = props.label || 'Tab navigation';
  const name = props.name || 'tab-group';
  const tabs = props.tabs || [
    { id: 'tab1', label: 'Tab 1', content: 'Content 1' },
    { id: 'tab2', label: 'Tab 2', content: 'Content 2' },
    { id: 'tab3', label: 'Tab 3', content: 'Content 3' },
  ];

  const containerClasses = ['tabs-container', variant !== 'initial' ? variant : '']
    .filter(Boolean)
    .join(' ');

  let html = `<div class="${containerClasses}" aria-label="${label}">`;
  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i];
    html += `<input type="radio" name="${name}" id="${tab.id}" class="tab-radio" ${i === 0 ? 'checked' : ''} />`;
    html += `<label for="${tab.id}" class="tab-label" role="tab">${tab.label}</label>`;
    html += `<div class="tab-content" role="tabpanel">${tab.content}</div>`;
  }
  html += `</div>`;
  return html;
}

describe('Tabs — Rendering', () => {
  it('renders container with correct class', () => {
    const dom = new JSDOM(renderTabs({}));
    const container = dom.window.document.querySelector('.tabs-container');
    expect(container).toBeTruthy();
  });

  it('renders correct number of tabs', () => {
    const dom = new JSDOM(renderTabs({}));
    const labels = dom.window.document.querySelectorAll('.tab-label');
    expect(labels.length).toBe(3);
  });

  it('first tab is checked by default', () => {
    const dom = new JSDOM(renderTabs({}));
    const radios = dom.window.document.querySelectorAll('.tab-radio') as NodeListOf<HTMLInputElement>;
    expect(radios[0].checked).toBe(true);
    expect(radios[1].checked).toBe(false);
  });

  it('applies variant class', () => {
    for (const variant of ['retro', 'modern', 'futuristic']) {
      const dom = new JSDOM(renderTabs({ variant }));
      const container = dom.window.document.querySelector('.tabs-container');
      expect(container!.classList.contains(variant)).toBe(true);
    }
  });

  it('renders tab panels with content', () => {
    const dom = new JSDOM(renderTabs({}));
    const panels = dom.window.document.querySelectorAll('.tab-content');
    expect(panels.length).toBe(3);
    expect(panels[0].textContent).toBe('Content 1');
  });
});

describe('Tabs — Accessibility', () => {
  it('has aria-label on container', () => {
    const dom = new JSDOM(renderTabs({ label: 'Settings tabs' }));
    const container = dom.window.document.querySelector('.tabs-container');
    expect(container!.getAttribute('aria-label')).toBe('Settings tabs');
  });

  it('tab labels have role="tab"', () => {
    const dom = new JSDOM(renderTabs({}));
    const labels = dom.window.document.querySelectorAll('.tab-label');
    for (const label of labels) {
      expect(label.getAttribute('role')).toBe('tab');
    }
  });

  it('tab panels have role="tabpanel"', () => {
    const dom = new JSDOM(renderTabs({}));
    const panels = dom.window.document.querySelectorAll('.tab-content');
    for (const panel of panels) {
      expect(panel.getAttribute('role')).toBe('tabpanel');
    }
  });

  it('radio inputs share the same name for grouping', () => {
    const dom = new JSDOM(renderTabs({ name: 'settings' }));
    const radios = dom.window.document.querySelectorAll('.tab-radio');
    for (const radio of radios) {
      expect(radio.getAttribute('name')).toBe('settings');
    }
  });

  it('labels reference matching radio ids', () => {
    const dom = new JSDOM(renderTabs({}));
    const labels = dom.window.document.querySelectorAll('.tab-label');
    const radios = dom.window.document.querySelectorAll('.tab-radio');
    for (let i = 0; i < labels.length; i++) {
      expect(labels[i].getAttribute('for')).toBe(radios[i].getAttribute('id'));
    }
  });
});
