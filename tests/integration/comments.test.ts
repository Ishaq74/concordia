import { describe, it, expect, vi } from 'vitest'

// Mocks required so module can be imported in a Node test environment
vi.mock('astro:actions', () => ({ defineAction: (opts: any) => ({ handler: opts.handler }) }))
vi.mock('astro:schema', () => {
  // Strict mocks: simulate zod validation
  const z = {
    string: () => {
      let minLen: number | undefined = undefined;
      let isOptional = false;
      let transformer: ((v: any) => any) | undefined = undefined;
      return {
        min(n: number) { minLen = n; return this; },
        optional() { isOptional = true; return this; },
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

import { commentActions } from '@/actions/comments'
import { createTestUser, generateUniqueEmail, generateUniqueUsername, generateSecurePassword } from '@tests/utils/auth-test-utils'
import { getDrizzle } from '@database/drizzle'
import { comments } from '@database/schemas'
import { eq } from 'drizzle-orm'

describe('Comments actions (createComment)', () => {
  it('throws UNAUTHORIZED when no user in context', async () => {
    const handler = (commentActions as any).createComment.handler
    await expect(handler({ entityId: 'x', entityType: 'blog', content: 'hi' }, { locals: {} })).rejects.toThrow('UNAUTHORIZED')
  })

  it('inserts comment into DB with correct fields (root comment)', async () => {
    const created = await createTestUser({ email: generateUniqueEmail('cm'), password: generateSecurePassword(), username: generateUniqueUsername(), emailVerified: true })
    const user = (created as any).user

    const handler = (commentActions as any).createComment.handler

    const input = {
      entityId: 'post-test-root',
      entityType: 'blog',
      content: 'Ceci est un commentaire de test',
      rating: '5',
    }

    const ctx = { locals: { user: { id: user.id, name: user.name || 'Test', email: user.email }, lang: 'fr' } }

    const res = await handler(input, ctx)
    expect(res.success).toBe(true)

    const db = await getDrizzle()
    const rows = await db.select().from(comments).where(eq(comments.entityId, 'post-test-root'))
    const found = rows.find((r: any) => r.authorEmail === user.email)
    expect(found).toBeDefined()
    if (!found) throw new Error('Comment not found')
    expect(found.status).toBe('approved')
    expect(found.rating).toBe(5)
    expect(found.parentId).toBeNull()
    expect(found.content && (found.content as any)['fr']).toContain('test')
  })

  it('inserts comment with parentId when reply', async () => {
    const created = await createTestUser({ email: generateUniqueEmail('cm2'), password: generateSecurePassword(), username: generateUniqueUsername(), emailVerified: true })
    const user = (created as any).user

    const handler = (commentActions as any).createComment.handler

    const input = {
      entityId: 'post-test-reply',
      entityType: 'blog',
      parentId: 'parent-123',
      content: 'Réponse au commentaire',
      rating: '4',
    }

    const ctx = { locals: { user: { id: user.id, name: user.name || 'Test', email: user.email }, lang: 'fr' } }

    const res = await handler(input, ctx)
    expect(res.success).toBe(true)

    const db = await getDrizzle()
    const rows = await db.select().from(comments).where(eq(comments.entityId, 'post-test-reply'))
    const found = rows.find((r: any) => r.authorEmail === user.email && r.parentId === 'parent-123')
    expect(found).toBeDefined()
    if (!found) throw new Error('Reply comment not found')
  })
})
