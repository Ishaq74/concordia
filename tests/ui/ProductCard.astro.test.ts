import { expect, test } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ProductCard from '@components/ui/ProductCard.astro';

test('ProductCard: rendu avec slots', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(ProductCard, {
    slots: { default: '<h3>Product Name</h3><p>Price: $99</p>' }
  });
  expect(html).toContain('product-card');
  expect(html).toContain('Product Name');
  expect(html).toContain('$99');
});

test('ProductCard: props variant et color', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(ProductCard, {
    props: { variant: 'retro', color: 'primary', className: 'custom-product' },
    slots: { default: '<h3>Product</h3>' }
  });
  expect(html).toContain('retro');
  expect(html).toContain('primary');
  expect(html).toContain('custom-product');
});

test('ProductCard: a11y role et aria-label', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(ProductCard, {
    props: { 'aria-label': 'Product', role: 'region' },
    slots: { default: '<h3>Product</h3>' }
  });
  expect(html).toContain('aria-label="Product"');
  expect(html).toContain('role="region"');
});
