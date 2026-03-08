import { describe, it, expect, vi, beforeAll } from 'vitest'
import { commentActions } from '@actions/comments'
import { getDrizzle } from '@database/drizzle'
import { blogComments } from '@database/schemas'
import { eq } from 'drizzle-orm'
import type { TestHelpers } from "better-auth/plugins"


// Mocks required so module can be imported in a Node test environment
vi.mock('astro:actions', () => ({ defineAction: (opts: any) => ({ handler: opts.handler }) }))
vi.mock('astro:schema', () => {
  // Strict mocks: simulate zod validation
  const z = {
    string: () => {
      let minLen: number | undefined = undefined;
      let transformer: ((v: any) => any) | undefined = undefined;
      return {
        min(n: number) { minLen = n; return this; },
        optional() { return this; },
        transform(fn: any) { transformer = fn; return this; },
        parse(v: any) {
          if (typeof v !== 'string') throw new Error('Not a string');
          if (minLen && v.length < minLen) throw new Error('Too short');
          return transformer ? transformer(v) : v;
        }
      };
    },
    object: (shape: any) => ({
      parse(obj: any) {
        for (const k in shape) {
          if (!(k in obj)) throw new Error(`Missing key: ${k}`);
          if (typeof shape[k].parse === 'function') shape[k].parse(obj[k]);
        }
        return obj;
      }
    }),
    enum: (arr: any[]) => {
      return {
        parse(v: any) {
          if (!arr.includes(v)) throw new Error('Invalid enum');
          return v;
        },
        optional() { return this; }
      };
    }
  };
  return { z };
})


describe('Comments actions (createComment)', () => {
  let test: TestHelpers
  beforeAll(async () => {
    const { auth } = await import('@lib/auth/auth')
    const ctx = await auth.$context
    test = ctx.test
  })

  it('throws UNAUTHORIZED when no user in context', async () => {
    const handler = (commentActions as any).createComment.handler
    await expect(handler({ postId: 'x', postType: 'blog', content: 'hi' }, { locals: {} })).rejects.toThrow('UNAUTHORIZED')
  })

  it('inserts comment into DB with correct fields (root comment)', async () => {
    const userObj = test.createUser({ emailVerified: true })
    const user = await test.saveUser(userObj)

    const handler = (commentActions as any).createComment.handler

    const input = {
      postId: 'post-test-root',
      postType: 'blog',
      content: 'Ceci est un commentaire de test',
      rating: '5',
    }

    const ctx = { locals: { user: { id: user.id, name: user.name || 'Test', email: user.email }, lang: 'fr' }, request: { url: 'http://localhost:4321/fr/' } }

    const res = await handler(input, ctx)
    expect(res.success).toBe(true)

    const db = await getDrizzle()
    const rows = await db.select().from(blogComments).where(eq(blogComments.postId, 'post-test-root'))
    const found = rows.find((r: any) => r.authorEmail === user.email)
    expect(found).toBeDefined()
    if (!found) throw new Error('Comment not found')
    // default status in test environment is pending rather than auto‑approved
    expect(found.status).toBe('pending')
    expect(found.rating).toBe(5)
    expect(found.parentId).toBeNull()
    expect(found.content && (found.content as any)['fr']).toContain('test')
  })

  it('inserts comment with parentId when reply', async () => {
    const userObj = test.createUser({ emailVerified: true })
    const user = await test.saveUser(userObj)

    const handler = (commentActions as any).createComment.handler

    const input = {
      postId: 'post-test-reply',
      postType: 'blog',
      parentId: 'parent-123',
      content: 'Réponse au commentaire',
      rating: '4',
    }

    const ctx = { locals: { user: { id: user.id, name: user.name || 'Test', email: user.email }, lang: 'fr' }, request: { url: 'http://localhost:4321/fr/' } }

    const res = await handler(input, ctx)
    expect(res.success).toBe(true)

    const db = await getDrizzle()
    const rows = await db.select().from(blogComments).where(eq(blogComments.postId, 'post-test-reply'))
    const found = rows.find((r: any) => r.authorEmail === user.email && r.parentId === 'parent-123')
    expect(found).toBeDefined()
    if (!found) throw new Error('Reply comment not found')
  })
})
