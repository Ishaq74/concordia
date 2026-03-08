import { describe, it, expect, beforeAll } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';

import Slider from '@components/ui/Slider/Slider.astro';
import SliderItem from '@components/ui/Slider/SliderItem.astro';

describe('Component: Slider', () => {
  let container: AstroContainer;
  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('renders with default props', async () => {
    const html = await container.renderToString(Slider, {
      slots: { default: '<li class="slider-item">Item 1</li>' },
    });
    expect(html).toBeTruthy();
  });

  it('applies variant and color classes', async () => {
    const html = await container.renderToString(Slider, {
      props: { variant: 'futuristic', color: 'accent' },
      slots: { default: '<li class="slider-item">Item</li>' },
    });
    expect(html).toContain('futuristic');
    expect(html).toContain('accent');
  });

  it('renders with controls enabled', async () => {
    const html = await container.renderToString(Slider, {
      props: { showControls: true },
      slots: { default: '<li class="slider-item">Item</li>' },
    });
    expect(html).toBeTruthy();
  });

  it('renders with auto-scroll', async () => {
    const html = await container.renderToString(Slider, {
      props: { autoScroll: true, scrollSpeed: 3 },
      slots: { default: '<li class="slider-item">Item</li>' },
    });
    expect(html).toBeTruthy();
  });
});

describe('Component: SliderItem', () => {
  let container: AstroContainer;
  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('renders as li with class', async () => {
    const html = await container.renderToString(SliderItem, {
      slots: { default: 'Slide content' },
    });
    expect(html).toContain('<li');
    expect(html).toContain('slider-item');
  });

  it('applies custom className', async () => {
    const html = await container.renderToString(SliderItem, {
      props: { className: 'custom-slide' },
      slots: { default: 'Custom' },
    });
    expect(html).toContain('custom-slide');
  });
});
