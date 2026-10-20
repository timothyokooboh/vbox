import { DefaultBreakpoints } from '../constants.js';
import type { Breakpoints } from '../types.js';

const numeric = '[+-]?(?:\\d+\\.?\\d*|\\.\\d+)(?:e[+-]?\\d+)?';
const dimension = new RegExp(`^(${numeric})([a-z]+)$`, 'i');
const zero = new RegExp(`^${numeric}$`, 'i');
const nonLengthUnits = new Set([
  'deg',
  'grad',
  'rad',
  'turn',
  's',
  'ms',
  'hz',
  'khz',
  'dpi',
  'dpcm',
  'dppx',
  'x',
  'fr',
]);

// Structural checks, not a second CSS parser or a browser support query. Unknown
// dimension units and the internals of math functions stay the browser's concern.
const isThreshold = (input: unknown): input is string => {
  if (typeof input !== 'string') return false;
  const value = input.trim();
  if (!value || /[;{}]/.test(value)) return false;
  const length = dimension.exec(value);
  if (length)
    return (
      Number.isFinite(Number(length[1])) &&
      !nonLengthUnits.has(length[2].toLowerCase())
    );
  if (zero.test(value)) return Number(value) === 0;
  if (!/^(calc|min|max|clamp)\(/i.test(value)) return false;
  if (!value.slice(value.indexOf('(') + 1, -1).trim()) return false;
  let depth = 0;
  for (let index = value.indexOf('('); index < value.length; index++) {
    if (value[index] === '(') depth++;
    if (value[index] === ')') depth--;
    if (depth <= 0 && index !== value.length - 1) return false;
  }
  return depth === 0 && value.endsWith(')');
};

export const resolveBreakpoints = (
  input?: Partial<Breakpoints>,
): Breakpoints => {
  if (
    input !== undefined &&
    (!input || typeof input !== 'object' || Array.isArray(input))
  )
    throw new TypeError(
      '[VBox] breakpoints must be an object of named length thresholds.',
    );
  const resolved = { ...DefaultBreakpoints };
  for (const [key, value] of Object.entries(input ?? {})) {
    if (!Object.hasOwn(DefaultBreakpoints, key))
      throw new TypeError(
        `[VBox] Unknown breakpoints.${key}; use sm, md, lg, xl or _2xl in configuration.`,
      );
    if (value === undefined) continue;
    if (!isThreshold(value))
      throw new TypeError(
        `[VBox] breakpoints.${key} requires a CSS length threshold (for example "48rem" or "calc(40rem + 1px)"). Received ${typeof value === 'string' ? JSON.stringify(value) : value === null ? 'null' : typeof value}.`,
      );
    resolved[key as keyof Breakpoints] = value;
  }
  return resolved;
};
