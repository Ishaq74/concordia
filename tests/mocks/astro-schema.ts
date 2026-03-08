/**
 * Shared mock for astro:schema — used by all test files that import Astro actions.
 *
 * Usage in test files:
 *   vi.mock('astro:schema', () => import('@tests/mocks/astro-schema'))
 */
export const z = {
  string: () => ({
    min: () => ({
      optional: () => ({ transform: (fn: any) => fn }),
      transform: (fn: any) => fn,
    }),
    optional: () => ({ transform: (fn: any) => fn }),
    transform: (fn: any) => fn,
  }),
  object: (shape: any) => shape,
  enum: () => ({}),
};
