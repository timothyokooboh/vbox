// @vitest-environment node
import { expect, test } from 'vitest';
import {
  parseStyleObject,
  DefaultBreakpoints,
  defineConfig,
  type AliasMap,
} from '../src/index';

const parse = (aliases: Record<string, string>) =>
  parseStyleObject({
    obj: { accent: '20px' },
    aliases: aliases as AliasMap,
    className: 'consumer',
    breakpoints: DefaultBreakpoints,
  });

test('two consumers can give the same alias different meanings in one process', () => {
  expect(parse({ accent: 'width' }).rootStyles).toEqual({ width: '20px' });
  expect(parse({ accent: 'height' }).rootStyles).toEqual({ height: '20px' });
  expect(parse({ accent: 'width' }).rootStyles).toEqual({ width: '20px' });
});

test('camel vendor names, custom-property case and numeric aliases normalize without ambiguity', () => {
  const result = parseStyleObject({
    obj: { WebkitUserSelect: 'none', '--Accent-Color': 'red', 'pad-2': '8px' },
    aliases: { pad2: 'padding' } as unknown as AliasMap,
    className: 'consumer',
    breakpoints: DefaultBreakpoints,
  });
  expect(result.rootStyles).toEqual({
    '-webkit-user-select': 'none',
    '--Accent-Color': 'red',
    padding: '8px',
  });
});

test('configuration rejects aliases that replace condition groups in any spelling', () => {
  for (const name of [
    'hover',
    'focus-visible',
    '_disabled',
    'disabled',
    '_2xl',
    '2xl',
    'dark',
  ]) {
    expect(() =>
      defineConfig({ aliases: { values: { [name]: 'color' } } }),
    ).toThrow(/reserved.*condition/i);
  }
});

test('unknown CSS keys do not accidentally resolve inherited Object properties as aliases', () => {
  const result = parseStyleObject({
    obj: { constructor: 'initial', toString: 'initial' },
    aliases: {} as AliasMap,
    className: 'future',
    breakpoints: DefaultBreakpoints,
  });
  expect(result.rootStyles).toEqual({
    constructor: 'initial',
    'to-string': 'initial',
  });
});
