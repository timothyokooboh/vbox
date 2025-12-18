/**
 * Creates a deterministic hash using the djb2 algorithm.
 *
 * This is fast, lightweight, and suitable for generating stable strings
 * e.g. keyframe names, etc.
 *
 * @param str - The input string to hash
 * @returns A hex string representation of the 32-bit hash
 */

export const createDjb2Hash = (str: string): string => {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return (h >>> 0).toString(16);
};
