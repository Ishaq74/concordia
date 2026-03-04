import { describe, it, expect } from 'vitest';
import { createBlogPost, updateBlogPost, deleteBlogPost, getBlogPostBySlug } from '@/database/blog';

// Integration tests for blog article CRUD

describe('Blog Article CRUD Integration', () => {
  let createdId: string;
  const testSlug = 'test-article-crud';

  it('should create a blog article', async () => {
    const result = await createBlogPost({
      title: 'Test Article',
      slug: testSlug,
      status: 'draft',
      inLanguage: 'fr',
    });
    expect(result).toHaveProperty('id');
    createdId = result.id;
    expect(result.slug).toBe(testSlug);
  });

  it('should update the blog article', async () => {
    const updated = await updateBlogPost(createdId, { title: 'Updated Title' });
    expect(updated.title).toBe('Updated Title');
  });

  it('should fetch the blog article by slug', async () => {
    const fetched = await getBlogPostBySlug(testSlug);
    expect(fetched).toBeDefined();
    expect(fetched.slug).toBe(testSlug);
  });

  it('should delete the blog article', async () => {
    const deleted = await deleteBlogPost(createdId);
    expect(deleted).toBe(true);
    const fetched = await getBlogPostBySlug(testSlug);
    expect(fetched).toBeNull();
  });
});
