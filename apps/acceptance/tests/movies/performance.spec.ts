import { test, expect } from '../browser/fixtures';
import { mockTmdb } from './tmdb';
import { mockArtwork } from './artwork';

test('card feedback stays transform-only without per-frame layout under 4x CPU throttling', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    browserName !== 'chromium',
    'CDP measurement is Chromium-only; behavior is covered in every engine.',
  );
  await mockTmdb(page);
  await mockArtwork(page);
  await page.goto('/');
  const card = page.getByRole('article').first();
  await card.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  const session = await page.context().newCDPSession(page);
  await session.send('Performance.enable');
  await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const before = await session.send('Performance.getMetrics');
  await card.hover();
  const afterEnter = await session.send('Performance.getMetrics');
  const durations = await page.evaluate(
    () =>
      new Promise<number[]>((resolve) => {
        const gaps: number[] = [];
        let previous = performance.now();
        const frame = (now: number) => {
          gaps.push(now - previous);
          previous = now;
          if (gaps.length < 30) requestAnimationFrame(frame);
          else resolve(gaps.slice(1));
        };
        requestAnimationFrame(frame);
      }),
  );
  const afterFrames = await session.send('Performance.getMetrics');
  await page.mouse.move(0, 0);
  await expect(card).toHaveCSS('transform', 'none');
  const after = await session.send('Performance.getMetrics');
  const metric = (snapshot: typeof after, name: string) =>
    snapshot.metrics.find((m) => m.name === name)?.value ?? 0;
  const layoutCount =
    metric(after, 'LayoutCount') - metric(before, 'LayoutCount');
  const sorted = durations.toSorted((a, b) => a - b);
  const duringLayoutCount =
    metric(afterFrames, 'LayoutCount') - metric(afterEnter, 'LayoutCount');
  const result = {
    cpuThrottle: 4,
    duringLayoutCount,
    frameGapMedianMs: sorted[Math.floor(sorted.length / 2)],
    frameGapP95Ms: sorted[Math.floor(sorted.length * 0.95)],
    layoutCount,
  };
  await testInfo.attach('card-performance', {
    body: JSON.stringify(result, null, 2),
    contentType: 'application/json',
  });
  console.info('Movies motion sample:', JSON.stringify(result));
  // Entering/leaving a transform establishes/removes a containing block once.
  // The 30-frame interval must not trigger per-frame layout.
  expect(layoutCount).toBeLessThanOrEqual(2);
  expect(duringLayoutCount).toBe(0);
  expect(
    await card.evaluate((el) => getComputedStyle(el).transitionProperty),
  ).toBe('transform');
  // A broad regression guard, not a claim that shared CI hardware sustains 60/120 fps.
  expect(result.frameGapP95Ms).toBeLessThan(100);
  await session.detach();
});
