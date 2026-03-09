import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';

/**
 * Unit tests for ShareButtons component.
 * Mirrors src/components/modules/blog/ui/ShareButtons.astro
 * Focuses on URL encoding security and link attributes.
 */

interface ShareButtonsProps {
  title: string;
  url?: string;
  variant?: 'initial' | 'retro' | 'modern' | 'futuristic';
}

function renderShareButtons(props: ShareButtonsProps): string {
  const { title, variant = 'initial' } = props;
  const url = props.url || 'https://concordia.example.com/article';
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    { name: 'X (Twitter)', href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}` },
    { name: 'LinkedIn', href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}` },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: 'Email', href: `mailto:?subject=${encodedTitle}&body=Regarde cet article : ${encodedUrl}` },
  ];

  return `<div class="share-container ${variant}">
    <span class="share-label">Partager :</span>
    ${shareLinks
      .map(
        (link) =>
          `<a href="${link.href}" target="_blank" rel="noopener noreferrer" aria-label="Partager sur ${link.name}">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"></svg>
      </a>`,
      )
      .join('')}
  </div>`;
}

describe('ShareButtons — Link generation', () => {
  it('generates 4 share links', () => {
    const dom = new JSDOM(renderShareButtons({ title: 'Mon article' }));
    const links = dom.window.document.querySelectorAll('a');
    expect(links.length).toBe(4);
  });

  it('generates Twitter intent URL', () => {
    const dom = new JSDOM(
      renderShareButtons({ title: 'Test', url: 'https://example.com' }),
    );
    const links = dom.window.document.querySelectorAll('a');
    const twitter = Array.from(links).find((a) =>
      a.getAttribute('href')?.includes('twitter.com'),
    );
    expect(twitter).toBeTruthy();
    expect(twitter!.getAttribute('href')).toContain('intent/tweet');
  });

  it('generates LinkedIn share URL', () => {
    const dom = new JSDOM(renderShareButtons({ title: 'Test' }));
    const links = dom.window.document.querySelectorAll('a');
    const linkedin = Array.from(links).find((a) =>
      a.getAttribute('href')?.includes('linkedin.com'),
    );
    expect(linkedin).toBeTruthy();
  });

  it('generates Facebook share URL', () => {
    const dom = new JSDOM(renderShareButtons({ title: 'Test' }));
    const links = dom.window.document.querySelectorAll('a');
    const facebook = Array.from(links).find((a) =>
      a.getAttribute('href')?.includes('facebook.com'),
    );
    expect(facebook).toBeTruthy();
  });

  it('generates mailto link', () => {
    const dom = new JSDOM(renderShareButtons({ title: 'Test' }));
    const links = dom.window.document.querySelectorAll('a');
    const email = Array.from(links).find((a) =>
      a.getAttribute('href')?.startsWith('mailto:'),
    );
    expect(email).toBeTruthy();
  });
});

describe('ShareButtons — Security', () => {
  it('all external links have target="_blank"', () => {
    const dom = new JSDOM(renderShareButtons({ title: 'Article' }));
    const links = dom.window.document.querySelectorAll('a');
    links.forEach((link) => {
      expect(link.getAttribute('target')).toBe('_blank');
    });
  });

  it('all external links have rel="noopener noreferrer"', () => {
    const dom = new JSDOM(renderShareButtons({ title: 'Article' }));
    const links = dom.window.document.querySelectorAll('a');
    links.forEach((link) => {
      const rel = link.getAttribute('rel');
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    });
  });

  it('encodes title with special characters', () => {
    const title = 'Article <script>alert("xss")</script>';
    const dom = new JSDOM(renderShareButtons({ title }));
    const links = dom.window.document.querySelectorAll('a');
    const twitterHref = Array.from(links)
      .find((a) => a.getAttribute('href')?.includes('twitter'))!
      .getAttribute('href')!;
    // Should be URL-encoded, not raw HTML
    expect(twitterHref).not.toContain('<script>');
    expect(twitterHref).toContain(encodeURIComponent(title));
  });

  it('encodes URL with special characters', () => {
    const url = 'https://example.com/path?a=1&b=2';
    const dom = new JSDOM(renderShareButtons({ title: 'Test', url }));
    const links = dom.window.document.querySelectorAll('a');
    const facebookHref = Array.from(links)
      .find((a) => a.getAttribute('href')?.includes('facebook'))!
      .getAttribute('href')!;
    expect(facebookHref).toContain(encodeURIComponent(url));
  });
});

describe('ShareButtons — Accessibility', () => {
  it('each link has descriptive aria-label', () => {
    const dom = new JSDOM(renderShareButtons({ title: 'Article' }));
    const links = dom.window.document.querySelectorAll('a');
    links.forEach((link) => {
      const label = link.getAttribute('aria-label');
      expect(label).toBeTruthy();
      expect(label).toContain('Partager sur');
    });
  });

  it('has share label text', () => {
    const dom = new JSDOM(renderShareButtons({ title: 'Article' }));
    const label = dom.window.document.querySelector('.share-label');
    expect(label).toBeTruthy();
    expect(label!.textContent).toContain('Partager');
  });
});

describe('ShareButtons — Variants', () => {
  it('applies variant class to container', () => {
    for (const variant of ['retro', 'modern', 'futuristic'] as const) {
      const dom = new JSDOM(renderShareButtons({ title: 'Test', variant }));
      const container = dom.window.document.querySelector('.share-container');
      expect(container!.classList.contains(variant)).toBe(true);
    }
  });
});
