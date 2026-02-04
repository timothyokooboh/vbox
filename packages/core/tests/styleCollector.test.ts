import { describe, expect, test } from 'vitest';
import { createStyleCollector } from '../src/helpers/styleRegistry';

describe('style collector', () => {
  test('collects and returns css', () => {
    const collector = createStyleCollector();
    collector.collect('.a { color: red; }');
    collector.collect('.b { color: blue; }');

    const css = collector.getCss();
    expect(css).toContain('.a');
    expect(css).toContain('.b');
  });

  test('preserves cascade order when re-adding css', () => {
    const collector = createStyleCollector();
    collector.collect('.a { color: red; }');
    collector.collect('.b { color: blue; }');
    collector.collect('.a { color: red; }');

    const css = collector.getCss();
    const firstB = css.indexOf('.b');
    const secondA = css.lastIndexOf('.a');
    expect(secondA).toBeGreaterThan(firstB);
  });

  test('reset clears collected css', () => {
    const collector = createStyleCollector();
    collector.collect('.a { color: red; }');
    collector.reset();
    expect(collector.getCss()).toBe('');
  });
});
