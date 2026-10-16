import type { Page } from '@playwright/test';
import { movie } from './tmdb';

// Authored, deterministic artwork at the external image boundary; not TMDB assets.
export async function mockArtwork(page: Page) {
  const titles = [
    'Signal',
    'After Hours',
    'The Quiet Earth',
    'Red Horizon',
    'Wild Light',
  ];
  await page.route(
    /api\.themoviedb\.org\/3\/(trending\/movie\/week|movie\/(popular|top_rated|now_playing))\?/,
    (route) =>
      route.fulfill({
        json: {
          page: 1,
          total_pages: 1,
          total_results: 5,
          results: titles.map((title, index) => ({
            ...movie,
            id: 101 + index,
            title,
            poster_path: `/poster-${index}.svg`,
          })),
        },
      }),
  );
  await page.route('https://image.tmdb.org/**', (route) => {
    const index = Number(
      route
        .request()
        .url()
        .match(/poster-(\d)/)?.[1] ?? 0,
    );
    const colors = ['#b67442', '#547298', '#6b8878', '#a34443', '#c19760'];
    return route.fulfill({
      contentType: 'image/svg+xml',
      body: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800"><defs><radialGradient id="sky"><stop stop-color="${colors[index]}"/><stop offset="1" stop-color="#111821"/></radialGradient><linearGradient id="ground" x2="0" y2="1"><stop stop-color="#19242c"/><stop offset="1" stop-color="#080d14"/></linearGradient></defs><path fill="url(#sky)" d="M0 0h600v800H0z"/><circle cx="400" cy="230" r="105" fill="#f8e6b6" opacity=".8"/><path d="M0 530 180 320 350 500 500 340 600 520V800H0Z" fill="url(#ground)"/><path d="M0 640 260 480 500 660 600 590V800H0Z" fill="#0b111b"/><text x="45" y="700" fill="#f8f3eb" font-family="serif" font-size="42">${titles[index]}</text><text x="48" y="740" fill="#c6c6c6" font-family="sans-serif" font-size="12" letter-spacing="4">ACCEPTANCE FIXTURE</text></svg>`,
    });
  });
}
