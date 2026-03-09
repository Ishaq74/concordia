/**
 * Strict astro:schema mock with real parse() validation.
 * Use for integration tests that need actual validation behavior.
 *
 * Usage: vi.mock('astro:schema', () => import('@tests/mocks/astro-schema-strict'))
 */
export const z = {
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
      },
    };
  },
  object: (shape: any) => ({
    parse(obj: any) {
      for (const k in shape) {
        if (!(k in obj)) throw new Error(`Missing key: ${k}`);
        if (typeof shape[k].parse === 'function') shape[k].parse(obj[k]);
      }
      return obj;
    },
  }),
  enum: (arr: any[]) => ({
    parse(v: any) {
      if (!arr.includes(v)) throw new Error('Invalid enum');
      return v;
    },
    optional() { return this; },
  }),
};
