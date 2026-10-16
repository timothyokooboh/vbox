import type { Page } from '@playwright/test';

export const movie = {
  id: 101,
  title: 'Signal',
  overview: 'A journey beyond the familiar.',
  poster_path: '/signal.jpg',
  backdrop_path: '/signal-wide.jpg',
  release_date: '2025-05-12',
  vote_average: 8.5,
  vote_count: 100,
  genre_ids: [878],
  original_language: 'en',
  adult: false,
};
export const searchMovie = { ...movie, id: 202, title: 'Matrix Station' };

export async function mockTmdb(page: Page) {
  const searchQueries: string[] = [];
  await page.route('https://api.themoviedb.org/3/**', async (route) => {
    const url = new URL(route.request().url());
    const endpoint = url.pathname.replace('/3', '');
    if (endpoint === '/search/movie')
      searchQueries.push(url.searchParams.get('query') ?? '');
    if (/^\/movie\/\d+$/.test(endpoint)) {
      const selected = endpoint.endsWith('202') ? searchMovie : movie;
      await route.fulfill({
        json: {
          ...selected,
          runtime: 126,
          genres: [{ id: 878, name: 'Science Fiction' }],
          status: 'Released',
          tagline: 'Follow the signal.',
        },
      });
    } else {
      await route.fulfill({
        json: {
          page: 1,
          total_pages: 1,
          total_results: 1,
          results: [endpoint === '/search/movie' ? searchMovie : movie],
        },
      });
    }
  });
  await page.addInitScript(() => {
    if (location.hostname === '127.0.0.1')
      localStorage.setItem('vueuse-color-scheme', 'dark');
  });
  return { searchQueries };
}
