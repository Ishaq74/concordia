import { describe, it, expect, beforeAll } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';

import Sheet from '@components/ui/Sheet/Sheet.astro';
import SheetTrigger from '@components/ui/Sheet/SheetTrigger.astro';
import SheetContent from '@components/ui/Sheet/SheetContent.astro';
import SheetClose from '@components/ui/Sheet/SheetClose.astro';
import SheetHeader from '@components/ui/Sheet/SheetHeader.astro';
import SheetTitle from '@components/ui/Sheet/SheetTitle.astro';
import SheetDescription from '@components/ui/Sheet/SheetDescription.astro';
import SheetFooter from '@components/ui/Sheet/SheetFooter.astro';

describe('Component: Sheet', () => {
  let container: AstroContainer;
  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('renders root sheet element', async () => {
    const html = await container.renderToString(Sheet, {
      props: { id: 'test-sheet' },
      slots: { default: '<p>Content</p>' },
    });
    expect(html).toBeTruthy();
    expect(html).toContain('sheet');
  });

  it('applies variant class', async () => {
    const html = await container.renderToString(Sheet, {
      props: { id: 'sheet-modern', variant: 'modern' },
      slots: { default: '<p>Modern</p>' },
    });
    expect(html).toContain('modern');
  });
});

describe('Component: SheetTrigger', () => {
  let container: AstroContainer;
  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('renders as label with for attribute', async () => {
    const html = await container.renderToString(SheetTrigger, {
      props: { htmlFor: 'test-sheet' },
      slots: { default: 'Open' },
    });
    expect(html).toBeTruthy();
    expect(html).toContain('for="test-sheet"');
    expect(html).toContain('role="button"');
  });
});

describe('Component: SheetContent', () => {
  let container: AstroContainer;
  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('renders content with default side (right)', async () => {
    const html = await container.renderToString(SheetContent, {
      props: { sheetId: 'test-sheet' },
      slots: { default: '<p>Body</p>' },
    });
    expect(html).toBeTruthy();
    expect(html).toContain('sheet-content');
  });
});

describe('Component: SheetClose', () => {
  let container: AstroContainer;
  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('renders close label', async () => {
    const html = await container.renderToString(SheetClose, {
      props: { htmlFor: 'test-sheet' },
      slots: { default: '✕' },
    });
    expect(html).toBeTruthy();
    expect(html).toContain('for="test-sheet"');
  });
});

describe('Component: SheetHeader', () => {
  let container: AstroContainer;
  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('renders header wrapper', async () => {
    const html = await container.renderToString(SheetHeader, {
      slots: { default: '<h2>Title</h2>' },
    });
    expect(html).toBeTruthy();
    expect(html).toContain('sheet-header');
  });
});

describe('Component: SheetTitle', () => {
  let container: AstroContainer;
  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('renders h2 with class', async () => {
    const html = await container.renderToString(SheetTitle, {
      slots: { default: 'My Sheet' },
    });
    expect(html).toContain('<h2');
    expect(html).toContain('sheet-title');
  });
});

describe('Component: SheetDescription', () => {
  let container: AstroContainer;
  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('renders paragraph with class', async () => {
    const html = await container.renderToString(SheetDescription, {
      slots: { default: 'Description text' },
    });
    expect(html).toContain('<p');
    expect(html).toContain('sheet-description');
  });
});

describe('Component: SheetFooter', () => {
  let container: AstroContainer;
  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('renders footer wrapper', async () => {
    const html = await container.renderToString(SheetFooter, {
      slots: { default: '<button>Save</button>' },
    });
    expect(html).toBeTruthy();
    expect(html).toContain('sheet-footer');
  });
});
