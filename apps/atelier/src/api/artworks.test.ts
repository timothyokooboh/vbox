import { afterEach, expect, it, vi } from 'vitest';
import { searchArtworks } from './artworks';
afterEach(() => vi.unstubAllGlobals());
it('searches title and artist within public-domain works and returns displayable metadata', async () => {
  vi.stubGlobal('fetch', async (input: string) => {
    const url = new URL(input);
    expect(url.origin + url.pathname).toBe(
      'https://api.artic.edu/api/v1/artworks/search',
    );
    const params = JSON.parse(url.searchParams.get('params')!);
    expect(params.query.bool.must).toEqual([
      { multi_match: { query: 'Monet', fields: ['title', 'artist_title'] } },
    ]);
    expect(params.query.bool.filter).toEqual([
      { term: { is_public_domain: true } },
    ]);
    expect(params.limit).toBe(12);
    expect(params.fields).not.toContain('description');
    return new Response(
      JSON.stringify({
        pagination: { total: 1 },
        config: { iiif_url: 'https://www.artic.edu/iiif/2' },
        data: [
          {
            id: 42,
            title: 'Water garden',
            artist_title: 'Claude Monet',
            is_public_domain: true,
            image_id: 'garden',
            date_display: '1906',
            medium_display: 'Oil',
            dimensions: '20 x 30 cm',
            thumbnail: { alt_text: 'Lilies on a pond' },
          },
        ],
      }),
    );
  });
  const result = await searchArtworks('Monet');
  expect(result).toMatchObject({
    total: 1,
    artworks: [
      {
        id: 42,
        title: 'Water garden',
        artist: 'Claude Monet',
        image: 'https://www.artic.edu/iiif/2/garden/full/843,/0/default.jpg',
        alt: 'Lilies on a pond',
        source: 'https://www.artic.edu/artworks/42',
      },
    ],
  });
});

it('does not expose non-public-domain works or image URLs outside the museum', async () => {
  vi.stubGlobal(
    'fetch',
    async () =>
      new Response(
        JSON.stringify({
          pagination: { total: 2 },
          config: { iiif_url: 'https://attacker.example/iiif/2' },
          data: [
            {
              id: 1,
              title: 'Restricted',
              is_public_domain: false,
              image_id: 'private',
            },
            {
              id: 2,
              title: 'Open work',
              is_public_domain: true,
              image_id: 'public',
            },
          ],
        }),
      ),
  );
  expect(await searchArtworks('art')).toMatchObject({
    artworks: [{ id: 2, image: null }],
  });
});

it('uses neutral fallbacks for incomplete records and ignores invalid record identifiers', async () => {
  vi.stubGlobal(
    'fetch',
    async () =>
      new Response(
        JSON.stringify({
          config: { iiif_url: 'https://www.artic.edu/iiif/2' },
          data: [
            null,
            { id: '../private', is_public_domain: true },
            { id: 9, title: null, is_public_domain: true, image_id: null },
          ],
        }),
      ),
  );
  expect(await searchArtworks('unknown')).toEqual({
    total: 1,
    artworks: [
      {
        id: 9,
        title: 'Untitled artwork',
        artist: 'Artist not recorded',
        date: 'Date not recorded',
        medium: 'Medium not recorded',
        dimensions: 'Dimensions not recorded',
        alt: 'Untitled artwork',
        image: null,
        source: 'https://www.artic.edu/artworks/9',
      },
    ],
  });
});

for (const status of [403, 429, 503]) {
  it(`reports HTTP ${status} as a failure rather than an empty successful collection`, async () => {
    vi.stubGlobal('fetch', async () => new Response('{}', { status }));
    await expect(searchArtworks('art')).rejects.toThrow('unavailable');
  });
}
it('rejects a malformed successful response', async () => {
  vi.stubGlobal('fetch', async () => new Response('{"error":"unexpected"}'));
  await expect(searchArtworks('art')).rejects.toThrow('unreadable collection');
});
it('lets the caller cancel the real fetch boundary', async () => {
  const controller = new AbortController();
  vi.stubGlobal('fetch', async (_input: string, options: RequestInit) => {
    expect(options.signal).toBe(controller.signal);
    options.signal!.throwIfAborted();
    return new Response('{}');
  });
  controller.abort();
  await expect(searchArtworks('art', controller.signal)).rejects.toMatchObject({
    name: 'AbortError',
  });
});

it('bounds displayed records even if an upstream response ignores the requested limit', async () => {
  vi.stubGlobal(
    'fetch',
    async () =>
      new Response(
        JSON.stringify({
          pagination: { total: 50 },
          data: Array.from({ length: 14 }, (_, id) => ({
            id: id + 1,
            title: 'Study',
            is_public_domain: true,
          })),
        }),
      ),
  );
  const result = await searchArtworks('art');
  expect(result.artworks).toHaveLength(12);
  expect(result.total).toBe(50);
});
