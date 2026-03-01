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

  test('always places override lane after base lane', () => {
    const collector = createStyleCollector();
    collector.collect('.base { color: blue; }', 'base');
    collector.collect('.override { color: yellow; }', 'override');

    const css = collector.getCss();
    expect(css.indexOf('.override')).toBeGreaterThan(css.indexOf('.base'));
  });

  test('preserves cascade order independently in each lane', () => {
    const collector = createStyleCollector();
    collector.collect('.base-a { color: red; }', 'base');
    collector.collect('.base-b { color: blue; }', 'base');
    collector.collect('.base-a { color: red; }', 'base');
    collector.collect('.over-a { color: orange; }', 'override');
    collector.collect('.over-b { color: yellow; }', 'override');
    collector.collect('.over-a { color: orange; }', 'override');

    const css = collector.getCss();
    expect(css.lastIndexOf('.base-a')).toBeGreaterThan(css.indexOf('.base-b'));
    expect(css.lastIndexOf('.over-a')).toBeGreaterThan(css.indexOf('.over-b'));
    expect(css.indexOf('.over-a')).toBeGreaterThan(css.lastIndexOf('.base-a'));
  });

  test('reset clears collected css', () => {
    const collector = createStyleCollector();
    collector.collect('.a { color: red; }');
    collector.reset();
    expect(collector.getCss()).toBe('');
  });
});
