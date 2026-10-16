import { test, expect } from '../browser/fixtures';

test('all linked documentation pages and local heading links resolve', async ({
  page,
  request,
  baseURL,
}) => {
  await page.goto('/');
  const pages = new Map<string, { ids: string[]; links: string[] }>();
  const pending = [new URL('/', baseURL!).href];
  const checked = new Set<string>();
  while (pending.length) {
    const address = pending.pop()!;
    if (checked.has(address)) continue;
    checked.add(address);
    const url = new URL(address);
    const hash = url.hash;
    url.hash = '';
    let document = pages.get(url.href);
    if (!document) {
      const response = await request.get(url.href);
      expect(response.status(), url.href).toBe(200);
      document = await page.evaluate(
        (html) => {
          const parsed = new DOMParser().parseFromString(html, 'text/html');
          return {
            ids: [...parsed.querySelectorAll('[id]')].map(
              (element) => element.id,
            ),
            links: [...parsed.querySelectorAll('a[href]')].map(
              (element) => element.getAttribute('href')!,
            ),
          };
        },
        await response.text(),
      );
      pages.set(url.href, document);
      for (const link of document.links) {
        const target = new URL(link, url);
        if (
          target.origin === url.origin &&
          (!/\.[a-z]+$/i.test(target.pathname) ||
            target.pathname.endsWith('.html'))
        )
          pending.push(target.href);
      }
    }
    if (hash)
      expect(document.ids, address).toContain(
        decodeURIComponent(hash.slice(1)),
      );
  }
  expect(pages.size).toBeGreaterThan(20);
});
