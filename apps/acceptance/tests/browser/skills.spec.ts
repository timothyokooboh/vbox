import { test, expect } from './fixtures';

const cases = [
  {
    name: 'authored',
    semantic: 'Semantic translation stays disabled',
    variant: 'Toggle skill variant',
    fragment: 'Skill fragment action',
    help: 'Fragment help stays unstyled by the caller.',
    priority: 'Skill priority',
    refinement: 'Refine skill dark md hover',
  },
  {
    name: 'independent agent',
    semantic: 'Translation disabled',
    variant: /Switch to .* variant/,
    fragment: 'Evaluated action',
    help: 'Use the adjacent button to perform the action.',
    priority: 'Hover to compare conditional colors',
    refinement: 'Enable purple hover in dark mode at md and above',
  },
];
for (const sample of cases) {
  test.describe(sample.name, () => {
    test('skill collision example preserves HTML meaning beside CSS translation', async ({
      page,
    }) => {
      await page.goto('/?ssr');
      const button = page.getByRole('button', {
        name: sample.semantic,
      });
      await expect(button).toHaveAttribute('translate', 'no');
      await expect(button).toHaveCSS('translate', '8px');
      await expect(button).toHaveCSS('color', 'rgb(255, 0, 0)');
    });

    test('skill PVA example composes ordered styles and compound variants', async ({
      page,
    }) => {
      await page.goto('/');
      const button = page.getByRole('button', { name: sample.variant });
      await expect(button).toHaveCSS('padding-left', '16px');
      await expect(button).toHaveCSS('background-color', 'rgb(0, 0, 0)');
      await button.click();
      await page.mouse.move(0, 0);
      await expect(button).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(button).toHaveCSS('color', 'rgb(0, 0, 0)');
      await expect(button).toHaveCSS('border-left-width', '2px');
      await button.hover();
      await expect(button).toHaveCSS('color', 'rgb(255, 0, 0)');
    });

    test('skill fragment example explicitly forwards the caller without restyling help', async ({
      page,
    }) => {
      await page.goto('/?ssr');
      const button = page.getByRole('button', { name: sample.fragment });
      await expect(button).toHaveCSS('color', 'rgb(255, 255, 0)');
      await button.hover();
      await expect(button).toHaveCSS('color', 'rgb(255, 0, 0)');
      await expect(page.getByText(sample.help)).not.toHaveCSS(
        'color',
        'rgb(255, 255, 0)',
      );
    });

    test('skill priority example follows theme-first and explicit refinement', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 500, height: 800 });
      await page.goto('/');
      const button = page.getByRole('button', {
        name: sample.priority,
        exact: true,
      });
      await button.hover();
      await expect(button).toHaveCSS('color', 'rgb(255, 0, 0)');
      await page.setViewportSize({ width: 1000, height: 800 });
      await button.hover();
      await expect(button).toHaveCSS('color', 'rgb(0, 128, 0)');
      await page.evaluate(() => document.documentElement.classList.add('dark'));
      await expect(button).toHaveCSS('color', 'rgb(0, 0, 255)');
      await page.getByRole('checkbox', { name: sample.refinement }).check();
      await button.hover();
      await expect(button).toHaveCSS('color', 'rgb(128, 0, 128)');
    });
  });
}
