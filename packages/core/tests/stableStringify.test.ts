import { describe, expect, test } from 'vitest';
import { stableStringify } from '../src/index';

describe('public stable serialization', () => {
  test('preserves distinct nested values and canonicalizes nested object keys', () => {
    const red = { hover: { color: 'red', padding: '1px' } };
    const blue = { hover: { color: 'blue', padding: '1px' } };
    expect(stableStringify(red)).not.toBe(stableStringify(blue));
    expect(JSON.parse(stableStringify(red))).toEqual(red);
    expect(stableStringify(red)).toBe(
      stableStringify({ hover: { padding: '1px', color: 'red' } }),
    );
  });
});

test('stable serialization preserves arrays, shared values and normal JSON behavior', () => {
  const shared = Object.freeze({ z: 1, a: 2 });
  const input = Object.freeze({
    list: [shared, { color: 'red' }],
    other: shared,
    date: new Date('2026-01-01T00:00:00Z'),
    absent: undefined,
  });
  expect(JSON.parse(stableStringify(input))).toEqual({
    list: [{ a: 2, z: 1 }, { color: 'red' }],
    other: { a: 2, z: 1 },
    date: '2026-01-01T00:00:00.000Z',
  });
  expect(stableStringify({ list: [1, 2] })).not.toBe(
    stableStringify({ list: [2, 1] }),
  );
  const cyclic: { self?: unknown } = {};
  cyclic.self = cyclic;
  expect(() => stableStringify(cyclic)).toThrow(TypeError);
});

test('preserves JSON primitive-wrapper unboxing and bigint failures', () => {
  const wrappers = {
    number: Object(7),
    string: Object('hello'),
    boolean: Object(false),
  };
  expect(JSON.parse(stableStringify(wrappers))).toEqual(
    JSON.parse(JSON.stringify(wrappers)),
  );
  expect(() => stableStringify({ bigint: Object(1n) })).toThrow(TypeError);
});
