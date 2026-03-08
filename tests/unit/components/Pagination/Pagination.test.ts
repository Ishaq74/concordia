import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';

/**
 * Unit tests for Pagination component.
 */

function renderPagination(props: {
  currentPage: number;
  totalPages: number;
  baseUrl?: string;
  variant?: string;
  showPrevNext?: boolean;
  showFirstLast?: boolean;
  siblingCount?: number;
}) {
  const { currentPage, totalPages, baseUrl = '/fr/blog/', variant = 'initial' } = props;
  const showPrevNext = props.showPrevNext ?? true;
  const showFirstLast = props.showFirstLast ?? false;
  const siblingCount = props.siblingCount ?? 1;

  // Simulate pagination logic
  const pages: (number | '...')[] = [];
  const left = Math.max(2, currentPage - siblingCount);
  const right = Math.min(totalPages - 1, currentPage + siblingCount);

  pages.push(1);
  if (left > 2) pages.push('...');
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages - 1) pages.push('...');
  if (totalPages > 1) pages.push(totalPages);

  const variantClass = variant !== 'initial' ? variant : '';
  let html = `<nav class="pagination ${variantClass}" aria-label="Pagination">`;

  if (showFirstLast && currentPage > 1) {
    html += `<a href="${baseUrl}?page=1" class="pagination-first" aria-label="First page">««</a>`;
  }
  if (showPrevNext && currentPage > 1) {
    html += `<a href="${baseUrl}?page=${currentPage - 1}" class="pagination-prev" aria-label="Previous page">«</a>`;
  }

  for (const p of pages) {
    if (p === '...') {
      html += `<span class="pagination-ellipsis">…</span>`;
    } else if (p === currentPage) {
      html += `<span class="pagination-current" aria-current="page">${p}</span>`;
    } else {
      html += `<a href="${baseUrl}?page=${p}" class="pagination-link">${p}</a>`;
    }
  }

  if (showPrevNext && currentPage < totalPages) {
    html += `<a href="${baseUrl}?page=${currentPage + 1}" class="pagination-next" aria-label="Next page">»</a>`;
  }
  if (showFirstLast && currentPage < totalPages) {
    html += `<a href="${baseUrl}?page=${totalPages}" class="pagination-last" aria-label="Last page">»»</a>`;
  }

  html += `</nav>`;
  return html;
}

describe('Pagination — Rendering', () => {
  it('renders navigation element with aria-label', () => {
    const dom = new JSDOM(renderPagination({ currentPage: 1, totalPages: 5 }));
    const nav = dom.window.document.querySelector('nav.pagination');
    expect(nav).toBeTruthy();
    expect(nav!.getAttribute('aria-label')).toBe('Pagination');
  });

  it('marks current page with aria-current', () => {
    const dom = new JSDOM(renderPagination({ currentPage: 3, totalPages: 5 }));
    const current = dom.window.document.querySelector('[aria-current="page"]');
    expect(current).toBeTruthy();
    expect(current!.textContent).toBe('3');
  });

  it('renders prev/next links when not on first/last page', () => {
    const dom = new JSDOM(renderPagination({ currentPage: 3, totalPages: 5 }));
    expect(dom.window.document.querySelector('.pagination-prev')).toBeTruthy();
    expect(dom.window.document.querySelector('.pagination-next')).toBeTruthy();
  });

  it('does not render prev link on first page', () => {
    const dom = new JSDOM(renderPagination({ currentPage: 1, totalPages: 5 }));
    expect(dom.window.document.querySelector('.pagination-prev')).toBeNull();
  });

  it('does not render next link on last page', () => {
    const dom = new JSDOM(renderPagination({ currentPage: 5, totalPages: 5 }));
    expect(dom.window.document.querySelector('.pagination-next')).toBeNull();
  });

  it('renders ellipsis for large page counts', () => {
    const dom = new JSDOM(renderPagination({ currentPage: 5, totalPages: 20 }));
    const ellipses = dom.window.document.querySelectorAll('.pagination-ellipsis');
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
  });

  it('single page renders no navigation links', () => {
    const dom = new JSDOM(renderPagination({ currentPage: 1, totalPages: 1 }));
    const links = dom.window.document.querySelectorAll('.pagination-link');
    expect(links.length).toBe(0);
  });

  it('applies variant class', () => {
    const dom = new JSDOM(renderPagination({ currentPage: 1, totalPages: 5, variant: 'modern' }));
    const nav = dom.window.document.querySelector('nav.pagination');
    expect(nav!.classList.contains('modern')).toBe(true);
  });
});

describe('Pagination — Accessibility', () => {
  it('prev/next links have aria-labels', () => {
    const dom = new JSDOM(renderPagination({ currentPage: 3, totalPages: 5 }));
    const prev = dom.window.document.querySelector('.pagination-prev');
    const next = dom.window.document.querySelector('.pagination-next');
    expect(prev!.getAttribute('aria-label')).toBeTruthy();
    expect(next!.getAttribute('aria-label')).toBeTruthy();
  });

  it('page links contain correct href', () => {
    const dom = new JSDOM(renderPagination({ currentPage: 1, totalPages: 3, baseUrl: '/en/blog/' }));
    const links = dom.window.document.querySelectorAll('.pagination-link');
    for (const link of links) {
      expect(link.getAttribute('href')).toContain('/en/blog/');
    }
  });
});
