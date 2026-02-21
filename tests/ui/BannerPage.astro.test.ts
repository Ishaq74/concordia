import { render } from '@testing-library/astro';
import BannerPage from '@/components/templates/BannerPage.astro';

describe('BannerPage template', () => {
  it('renders title and subtitle', async () => {
    const { getByText } = await render(BannerPage, {
      title: 'Bonjour',
      subtitle: 'Sous-titre',
    });
    getByText('Bonjour');
    getByText('Sous-titre');
  });

  it('applies variant and color classes and shows meta', async () => {
    const { container, getByText } = await render(BannerPage, {
      title: 'Post',
      type: 'article',
      color: 'secondary',
      author: 'Alice',
      date: '2025-01-01',
    });

    expect(container.querySelector('header')?.classList).toContain('article');
    expect(container.querySelector('header')?.classList).toContain('secondary');
    getByText('Alice');
    getByText('2025-01-01');
  });

  it('renders breadcrumbs when passed', async () => {
    const { getByText } = await render(BannerPage, {
      title: 'Deep',
      type: 'article', // arbitrary type
      breadcrumbs: [
        { label: 'Blog', href: '/blog' },
        { label: 'Category', href: '/blog/category' }
      ]
    });

    getByText('Blog');
    getByText('Category');
  });
});