import { test, expect } from './fixtures';

test('finite style reuse plateaus across updates, withdrawal and remount; unique-value costs are recorded', async ({
  page,
  browserName,
}, testInfo) => {
  test.setTimeout(60_000);
  await page.goto('/?ssr');
  const width = page.getByRole('spinbutton', { name: 'Resource width' });
  const toggle = page.getByRole('button', { name: 'Toggle resource target' });
  const contribution = page.getByRole('button', {
    name: 'Toggle resource contribution',
  });
  const target = page.getByTestId('resource-target');
  const shared = page.getByTestId('resource-shared');
  const snapshot = () =>
    page.evaluate(() => {
      const element = document.getElementById(
        'vbox-style-sheet',
      ) as HTMLStyleElement | null;
      return {
        sheets: document.querySelectorAll('#vbox-style-sheet').length,
        cssBytes: new TextEncoder().encode(element?.textContent ?? '').length,
        rules: element?.sheet?.cssRules.length ?? 0,
        liveNodes: document.querySelectorAll('*').length,
      };
    });
  const session =
    browserName === 'chromium'
      ? await page.context().newCDPSession(page)
      : null;
  const heap = async () => {
    if (!session) return null;
    await session.send('HeapProfiler.collectGarbage');
    return (await session.send('Runtime.getHeapUsage')).usedSize;
  };
  try {
    const cycle = async () => {
      await width.fill('21');
      await expect(target).toHaveCSS('width', '21px');
      await contribution.click();
      await expect(target).toHaveCount(1);
      await expect(target).toHaveCSS('width', '10px');
      await expect(target).toHaveCSS('color', 'rgb(0, 0, 0)');
      await contribution.click();
      await expect(target).toHaveCSS('width', '21px');
      await expect(target).toHaveCSS('color', 'rgb(255, 0, 0)');
      await width.fill('20');
      await expect(target).toHaveCSS('width', '20px');
      await toggle.click();
      await expect(target).toHaveCount(0);
      await expect(shared).toHaveCSS('color', 'rgb(255, 0, 0)');
      await expect(shared).toHaveCSS('width', '20px');
      await toggle.click();
      await expect(target).toHaveCSS('width', '20px');
      await expect(target).toHaveCSS('color', 'rgb(255, 0, 0)');
    };
    await cycle();
    await cycle();
    const warmed = await snapshot();
    const heapBefore = await heap();
    const start = performance.now();
    for (let index = 0; index < 20; index++) await cycle();
    const finiteMs = performance.now() - start;
    const finite = await snapshot();
    const heapFinite = await heap();
    expect(finite).toEqual(warmed);
    expect(finite.sheets).toBe(1);
    for (let value = 30; value < 50; value++) {
      await width.fill(String(value));
      await expect(target).toHaveCSS('width', `${value}px`);
    }
    const unique = await snapshot();
    await toggle.click();
    await expect(target).toHaveCount(0);
    await expect(shared).toHaveCSS('width', '20px');
    const unmounted = await snapshot();
    const result = {
      warmed,
      finite,
      unique,
      unmounted,
      finiteMs,
      heapBefore,
      heapFinite,
      heapAfterUnique: await heap(),
    };
    await testInfo.attach('style-resource-measurements', {
      body: JSON.stringify(result, null, 2),
      contentType: 'application/json',
    });
    console.info('Style resource measurements:', JSON.stringify(result));
    // Retention of previously generated CSS is measured, not presented as eviction.
    expect(unmounted.liveNodes).toBe(finite.liveNodes - 1);
    expect(unique.sheets).toBe(1);
  } finally {
    await session?.detach();
  }
});
