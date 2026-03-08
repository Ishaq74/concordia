import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock astro:actions - strips defineAction to just extract the handler
vi.mock('astro:actions', () => ({
  defineAction: (opts: any) => ({ handler: opts.handler }),
}));

vi.mock('astro:schema', () => {
  const z = {
    string: () => ({
      min: () => ({ optional: () => ({ transform: (fn: any) => fn }), transform: (fn: any) => fn }),
      optional: () => ({ transform: (fn: any) => fn }),
      transform: (fn: any) => fn,
    }),
    object: (shape: any) => shape,
    enum: () => ({}),
  };
  return { z };
});

const { mockDb, mockTx } = vi.hoisted(() => {
  const mockTx = {
    insert: vi.fn(),
    update: vi.fn(),
    query: {
      blogTranslations: {
        findFirst: vi.fn(),
      },
    },
  };

  const mockDb = {
    transaction: vi.fn((fn: any) => fn(mockTx)),
    update: vi.fn(),
    delete: vi.fn(),
    query: {
      blogPosts: {
        findFirst: vi.fn(),
      },
    },
  };

  // Chain builders
  mockTx.insert.mockReturnValue({
    values: vi.fn().mockReturnValue({
      onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
    }),
  });
  mockTx.update.mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    }),
  });

  mockDb.update.mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    }),
  });
  mockDb.delete.mockReturnValue({
    where: vi.fn().mockResolvedValue(undefined),
  });

  return { mockDb, mockTx };
});

vi.mock('@database/drizzle', () => ({
  getDrizzle: vi.fn(() => mockDb),
}));

vi.mock('@database/schemas', () => ({
  blogPosts: { id: 'id' },
  blogTranslations: { postId: 'postId', inLanguage: 'inLanguage', id: 'id' },
}));

vi.mock('nanoid', () => ({ nanoid: () => 'test-nanoid-id' }));

// Mock fs to prevent actual file writes
vi.mock('node:fs/promises', () => ({
  default: {
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('blogActions.savePost', () => {
  let blogActions: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockTx.query.blogTranslations.findFirst.mockResolvedValue(null);
    // Re-setup chain mocks after clear
    mockTx.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
      }),
    });
    mockTx.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    });
    const mod = await import('@actions/blog');
    blogActions = mod.blogActions;
  });

  function makeFormData(fields: Record<string, string>) {
    return {
      get: (key: string) => fields[key] ?? null,
    };
  }

  it('throws Unauthorized if user is not admin', async () => {
    const handler = blogActions.savePost.handler;
    const formData = makeFormData({ slug: 'test', headline_fr: 'Title' });
    const context = { locals: { user: { role: 'member' } } };
    await expect(handler(formData, context)).rejects.toThrow('Unauthorized');
  });

  it('throws Unauthorized if no user', async () => {
    const handler = blogActions.savePost.handler;
    const formData = makeFormData({ slug: 'test' });
    const context = { locals: {} };
    await expect(handler(formData, context)).rejects.toThrow('Unauthorized');
  });

  it('inserts new post and translations in a transaction', async () => {
    const handler = blogActions.savePost.handler;
    const formData = makeFormData({
      slug: 'my-post',
      headline_fr: 'Mon article',
      content_fr: 'Contenu',
      excerpt_fr: 'Extrait',
    });
    const context = { locals: { user: { role: 'admin' } } };

    const result = await handler(formData, context);
    expect(result).toEqual({ success: true });
    expect(mockDb.transaction).toHaveBeenCalled();
    expect(mockTx.insert).toHaveBeenCalled();
  });

  it('updates existing translation if found', async () => {
    mockTx.query.blogTranslations.findFirst.mockResolvedValue({ id: 'existing-id' });

    const handler = blogActions.savePost.handler;
    const formData = makeFormData({
      slug: 'my-post',
      headline_fr: 'Updated',
      content_fr: 'Updated content',
    });
    const context = { locals: { user: { role: 'admin' } } };

    const result = await handler(formData, context);
    expect(result).toEqual({ success: true });
    expect(mockTx.update).toHaveBeenCalled();
  });

  it('uses provided id from formData when available', async () => {
    const handler = blogActions.savePost.handler;
    const formData = makeFormData({
      id: 'my-custom-id',
      slug: 'my-post',
      headline_fr: 'Title',
    });
    const context = { locals: { user: { role: 'admin' } } };

    await handler(formData, context);
    expect(mockDb.transaction).toHaveBeenCalled();
  });
});

describe('blogActions.changeStatus', () => {
  let blogActions: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    });
    const mod = await import('@actions/blog');
    blogActions = mod.blogActions;
  });

  it('throws UNAUTHORIZED if no user', async () => {
    const handler = blogActions.changeStatus.handler;
    await expect(
      handler({ id: 'x', status: 'draft' }, { locals: {} })
    ).rejects.toThrow('UNAUTHORIZED');
  });

  it('throws POST_NOT_FOUND if post does not exist', async () => {
    mockDb.query.blogPosts.findFirst.mockResolvedValue(null);
    const handler = blogActions.changeStatus.handler;
    await expect(
      handler({ id: 'x', status: 'draft' }, { locals: { user: { role: 'admin' } } })
    ).rejects.toThrow('POST_NOT_FOUND');
  });

  it('throws FORBIDDEN if user is not admin', async () => {
    mockDb.query.blogPosts.findFirst.mockResolvedValue({ id: 'x', status: 'published' });
    const handler = blogActions.changeStatus.handler;
    await expect(
      handler({ id: 'x', status: 'draft' }, { locals: { user: { role: 'member' } } })
    ).rejects.toThrow('FORBIDDEN');
  });

  it('updates status for admin user', async () => {
    mockDb.query.blogPosts.findFirst.mockResolvedValue({ id: 'x', status: 'published' });
    const handler = blogActions.changeStatus.handler;
    const result = await handler(
      { id: 'x', status: 'draft' },
      { locals: { user: { role: 'admin' } } }
    );
    expect(result).toEqual({ success: true });
    expect(mockDb.update).toHaveBeenCalled();
  });
});

describe('blogActions.deletePost', () => {
  let blogActions: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDb.delete.mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    });
    const mod = await import('@actions/blog');
    blogActions = mod.blogActions;
  });

  it('throws UNAUTHORIZED if no user', async () => {
    const handler = blogActions.deletePost.handler;
    await expect(
      handler({ id: 'x' }, { locals: {} })
    ).rejects.toThrow('UNAUTHORIZED');
  });

  it('throws POST_NOT_FOUND if post does not exist', async () => {
    mockDb.query.blogPosts.findFirst.mockResolvedValue(null);
    const handler = blogActions.deletePost.handler;
    await expect(
      handler({ id: 'x' }, { locals: { user: { role: 'admin' } } })
    ).rejects.toThrow('POST_NOT_FOUND');
  });

  it('throws FORBIDDEN if user is not admin', async () => {
    mockDb.query.blogPosts.findFirst.mockResolvedValue({ id: 'x' });
    const handler = blogActions.deletePost.handler;
    await expect(
      handler({ id: 'x' }, { locals: { user: { role: 'member' } } })
    ).rejects.toThrow('FORBIDDEN');
  });

  it('deletes post for admin user', async () => {
    mockDb.query.blogPosts.findFirst.mockResolvedValue({ id: 'x' });
    const handler = blogActions.deletePost.handler;
    const result = await handler(
      { id: 'x' },
      { locals: { user: { role: 'admin' } } }
    );
    expect(result).toEqual({ success: true });
    expect(mockDb.delete).toHaveBeenCalled();
  });
});
