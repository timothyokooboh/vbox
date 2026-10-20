import type { Page } from '@playwright/test';

export const artwork = (id: number, title: string) => ({
  id,
  title,
  artist_title: 'Demo Artist',
  date_display: '1906',
  medium_display: 'Oil on canvas',
  dimensions: '40 x 60 cm',
  is_public_domain: true,
  image_id: `fixture-${id}`,
  thumbnail: { alt_text: `Original test illustration for ${title}` },
});
export const response = (data: unknown[], total = data.length) => ({
  pagination: { total },
  data,
  config: { iiif_url: 'https://www.artic.edu/iiif/2' },
});
export async function mockMuseum(
  page: Page,
  theme: 'light' | 'auto' = 'light',
) {
  await page.route('https://api.artic.edu/**', (route) => {
    const url = new URL(route.request().url());
    if (url.pathname !== '/api/v1/artworks/search')
      throw new Error(`Unexpected museum endpoint: ${url.pathname}`);
    const params = JSON.parse(url.searchParams.get('params')!);
    const query = params.query.bool.must?.[0]?.multi_match.query ?? '';
    return route.fulfill({
      json: response(
        query === 'Monet'
          ? [artwork(42, 'Water Garden'), artwork(43, 'Morning Light')]
          : [
              artwork(1, 'Evening Study'),
              artwork(2, 'The Quiet Orchard'),
              artwork(3, 'On the Shore'),
              artwork(4, 'Gathered Light'),
              artwork(5, 'After the Rain'),
              artwork(6, 'A Green Stillness'),
            ],
        24,
      ),
    });
  });
  await page.route('https://www.artic.edu/iiif/2/**', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 650"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#c7c3a5"/><stop offset="1" stop-color="#e4c591"/></linearGradient></defs><path fill="url(#sky)" d="M0 0h800v650H0z"/><circle cx="580" cy="210" r="70" fill="#eee1b2"/><path d="M0 400Q130 270 310 370T800 320V650H0" fill="#7f9165"/><path d="M0 470Q240 350 420 440T800 420V650H0" fill="#3b6051"/><path d="M0 550Q180 480 350 530T800 490V650H0" fill="#233d34"/><path d="M560 650 460 520 430 430 470 360 480 320" fill="none" stroke="#d9be94" stroke-width="25"/></svg>`,
    }),
  );
  await page.addInitScript((theme) => {
    if (!localStorage.getItem('atelier-theme'))
      localStorage.setItem('atelier-theme', theme);
  }, theme);
}
