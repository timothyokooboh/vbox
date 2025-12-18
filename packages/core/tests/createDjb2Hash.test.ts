import { describe, test, expect } from 'vitest';
import { createDjb2Hash } from '../src/helpers/createDjb2Hash';

describe('createDjb2Hash', () => {
  test('returns a string', () => {
    const result = createDjb2Hash('hello');
    expect(typeof result).toBe('string');
  });

  test('returns a consistent hash for the same input', () => {
    const input = 'test-input';
    const hash1 = createDjb2Hash(input);
    const hash2 = createDjb2Hash(input);
    expect(hash1).toBe(hash2);
  });

  test('returns different hashes for different inputs', () => {
    const hash1 = createDjb2Hash('foo');
    const hash2 = createDjb2Hash('bar');
    expect(hash1).not.toBe(hash2);
  });

  test('handles empty string', () => {
    const hash = createDjb2Hash('');
    expect(hash).toBe((5381 >>> 0).toString(16));
  });

  test('handles unicode characters correctly', () => {
    const hash1 = createDjb2Hash('💻🚀');
    const hash2 = createDjb2Hash('💻🚀');
    const hash3 = createDjb2Hash('💻');
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
  });

  test('produces lowercase hexadecimal string', () => {
    const hash = createDjb2Hash('hello world');
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });
});
