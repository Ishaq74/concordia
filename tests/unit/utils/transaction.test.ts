import { describe, it, expect, vi } from 'vitest';
import { withTestTransaction } from '@tests/utils/transaction';

/**
 * Tests for the withTestTransaction utility.
 * The utility throws when no raw PostgreSQL connection is available.
 * These tests verify the guard behaviour in a test environment.
 */

vi.mock('astro:schema', () => ({
  z: {
    string: () => ({ min: () => ({ optional: () => ({}) }), optional: () => ({}) }),
    object: () => ({ parse: (v: unknown) => v }),
    enum: () => ({}),
  },
}));

describe('withTestTransaction', () => {
  it('throws meaningful error when raw client is unavailable', async () => {
    await expect(
      withTestTransaction(async () => 42),
    ).rejects.toThrow('Unable to obtain raw client for transactions');
  });

  it('error message guides developer to use real PostgreSQL', async () => {
    try {
      await withTestTransaction(async () => {});
    } catch (err) {
      expect((err as Error).message).toContain('raw client');
    }
  });
});
