import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock astro:actions
vi.mock('astro:actions', () => ({
  defineAction: (opts: any) => ({ handler: opts.handler }),
}));

vi.mock('astro:schema', () => import('@tests/mocks/astro-schema'));

const { mockDb } = vi.hoisted(() => {
  const mockDb = {
    insert: vi.fn(),
  };
  mockDb.insert.mockReturnValue({
    values: vi.fn().mockResolvedValue(undefined),
  });
  return { mockDb };
});

vi.mock('@database/drizzle', () => ({
  getDrizzle: vi.fn(() => mockDb),
}));

vi.mock('@database/schemas/blog_comments.schema', () => ({
  blogComments: { id: 'id' },
}));

vi.mock('nanoid', () => ({ nanoid: () => 'comment-id' }));

// COMBINED_DANGEROUS is a real regex — use real import
vi.mock('@lib/auth/validate-user', () => ({
  COMBINED_DANGEROUS: /(<script|javascript:|on\w+=)/i,
}));

describe('commentActions.createComment', () => {
  let commentActions: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDb.insert.mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    });
    const mod = await import('@actions/comments');
    commentActions = mod.commentActions;
  });

  function makeContext(user: any, url = 'http://localhost/fr/blog/test') {
    return {
      locals: { user },
      request: { url },
    };
  }

  it('throws UNAUTHORIZED if no user', async () => {
    const handler = commentActions.createComment.handler;
    await expect(
      handler(
        { postId: 'p1', postType: 'blog', content: 'hello' },
        makeContext(null)
      )
    ).rejects.toThrow('UNAUTHORIZED');
  });

  it('inserts comment with correct fields', async () => {
    const handler = commentActions.createComment.handler;
    const result = await handler(
      { postId: 'p1', postType: 'blog', content: 'Great post!', rating: 0 },
      makeContext({ name: 'Alice', email: 'alice@test.com' })
    );
    expect(result).toEqual({ success: true });
    expect(mockDb.insert).toHaveBeenCalled();

    const valuesCall = mockDb.insert.mock.results[0].value.values;
    const insertedData = valuesCall.mock.calls[0][0];
    expect(insertedData.postId).toBe('p1');
    expect(insertedData.authorName).toBe('Alice');
    expect(insertedData.status).toBe('pending');
  });

  it('extracts locale from URL', async () => {
    const handler = commentActions.createComment.handler;
    await handler(
      { postId: 'p1', postType: 'blog', content: 'Nice', rating: 0 },
      makeContext({ name: 'Bob', email: 'bob@test.com' }, 'http://localhost/en/blog/test')
    );

    const valuesCall = mockDb.insert.mock.results[0].value.values;
    const insertedData = valuesCall.mock.calls[0][0];
    expect(insertedData.inLanguage).toBe('en');
  });

  it('defaults to fr when no locale in URL', async () => {
    const handler = commentActions.createComment.handler;
    await handler(
      { postId: 'p1', postType: 'blog', content: 'Bonjour', rating: 0 },
      makeContext({ name: 'User', email: 'u@test.com' }, 'http://localhost/blog/test')
    );

    const valuesCall = mockDb.insert.mock.results[0].value.values;
    const insertedData = valuesCall.mock.calls[0][0];
    expect(insertedData.inLanguage).toBe('fr');
  });

  it('rejects dangerous content (XSS)', async () => {
    const handler = commentActions.createComment.handler;
    await expect(
      handler(
        { postId: 'p1', postType: 'blog', content: '<script>alert(1)</script>' },
        makeContext({ name: 'Hacker', email: 'hack@test.com' })
      )
    ).rejects.toThrow('INVALID_CONTENT');
  });

  it('handles parentId for reply comments', async () => {
    const handler = commentActions.createComment.handler;
    await handler(
      { postId: 'p1', postType: 'blog', content: 'Reply', parentId: 'parent-1', rating: 0 },
      makeContext({ name: 'Replier', email: 'r@test.com' })
    );

    const valuesCall = mockDb.insert.mock.results[0].value.values;
    const insertedData = valuesCall.mock.calls[0][0];
    expect(insertedData.parentId).toBe('parent-1');
  });

  it('uses Anonyme when user has no name', async () => {
    const handler = commentActions.createComment.handler;
    await handler(
      { postId: 'p1', postType: 'blog', content: 'Anonymous', rating: 0 },
      makeContext({ email: 'anon@test.com' })
    );

    const valuesCall = mockDb.insert.mock.results[0].value.values;
    const insertedData = valuesCall.mock.calls[0][0];
    expect(insertedData.authorName).toBe('Anonyme');
  });
});
