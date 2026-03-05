
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { getDrizzle } from './drizzle';
import { blogPosts } from './schemas/blog_posts.schema';

// simple helper layer used by integration tests (and potentially other parts of the app)
export interface BlogPostInput {
  title: string;
  slug: string;
  status: string;
  inLanguage: string;
  [key: string]: unknown;
}

export async function createBlogPost(data: BlogPostInput) {
  const db = await getDrizzle();
  const id = randomUUID();
  const now = new Date();
  const [inserted] = await db
    .insert(blogPosts)
    .values({
      id,
      slug: data.slug,
      status: data.status,
      inLanguage: data.inLanguage,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return inserted;
}

export async function updateBlogPost(id: string, updates: Partial<BlogPostInput>) {
  const db = await getDrizzle();
  const now = new Date();
  await db
    .update(blogPosts)
    .set({ ...updates, updatedAt: now } as any)
    .where(eq(blogPosts.id, id));
  const [row] = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1);
  return row;
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  const db = await getDrizzle();
  const result = await db.delete(blogPosts).where(eq(blogPosts.id, id));
  return (result as any).rowCount > 0;
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDrizzle();
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1);
  return post || null;
}
