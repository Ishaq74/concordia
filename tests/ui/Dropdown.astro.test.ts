import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Dropdown from '@components/ui/Dropdown.astro';

describe('Dropdown.astro', () => {
  it('renders slot content and default classes', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Dropdown, {
      slots: { default: '<button>Open</button><ul><li>Item</li></ul>' }
    });
    expect(html).toContain('dropdown');
    expect(html).toContain('Open');
    expect(html).toContain('Item');
  });

  it('applies variant and color props', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Dropdown, {
      props: { variant: 'modern', color: 'primary', className: 'custom-dropdown' },
      slots: { default: '<button>Open</button>' }
    });
    expect(html).toContain('modern');
    expect(html).toContain('primary');
    expect(html).toContain('custom-dropdown');
  });

  it('renders with aria-haspopup for accessibility', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Dropdown, {
      props: { 'aria-haspopup': 'true' },
      slots: { default: '<button>Open</button>' }
    });
    expect(html).toContain('aria-haspopup="true"');
  });
});
