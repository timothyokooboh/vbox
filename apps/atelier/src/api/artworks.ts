export interface Artwork {
  id: number;
  title: string;
  artist: string;
  date: string;
  medium: string;
  dimensions: string;
  alt: string;
  image: string | null;
  source: string;
}
export interface ArtworkPage {
  artworks: Artwork[];
  total: number;
}
const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const text = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback;

export async function searchArtworks(
  query: string,
  signal?: AbortSignal,
): Promise<ArtworkPage> {
  const params = {
    limit: 12,
    fields: [
      'id',
      'title',
      'artist_title',
      'date_display',
      'medium_display',
      'dimensions',
      'is_public_domain',
      'image_id',
      'thumbnail',
    ],
    query: {
      bool: {
        must: [{ multi_match: { query, fields: ['title', 'artist_title'] } }],
        filter: [{ term: { is_public_domain: true } }],
      },
    },
  };
  const url = new URL('https://api.artic.edu/api/v1/artworks/search');
  url.searchParams.set('params', JSON.stringify(params));
  const response = await fetch(url.toString(), { signal });
  if (!response.ok)
    throw new Error('The collection is unavailable. Please try again.');
  const payload = record(await response.json());
  if (!Array.isArray(payload.data))
    throw new Error('The museum returned an unreadable collection.');
  const base = record(payload.config).iiif_url;
  const trustedImages = base === 'https://www.artic.edu/iiif/2';
  const artworks = payload.data
    .flatMap((value): Artwork[] => {
      const work = record(value);
      if (
        work.is_public_domain !== true ||
        typeof work.id !== 'number' ||
        !Number.isSafeInteger(work.id) ||
        work.id < 1
      )
        return [];
      const title = text(work.title, 'Untitled artwork');
      const imageId =
        typeof work.image_id === 'string' &&
        /^[a-zA-Z0-9-]+$/.test(work.image_id)
          ? work.image_id
          : null;
      return [
        {
          id: work.id,
          title,
          artist: text(work.artist_title, 'Artist not recorded'),
          date: text(work.date_display, 'Date not recorded'),
          medium: text(work.medium_display, 'Medium not recorded'),
          dimensions: text(work.dimensions, 'Dimensions not recorded'),
          alt: text(record(work.thumbnail).alt_text, title),
          image:
            trustedImages && imageId
              ? `${base}/${imageId}/full/843,/0/default.jpg`
              : null,
          source: `https://www.artic.edu/artworks/${work.id}`,
        },
      ];
    })
    .slice(0, 12);
  const total = record(payload.pagination).total;
  return {
    artworks,
    total:
      typeof total === 'number' &&
      Number.isSafeInteger(total) &&
      total >= artworks.length
        ? total
        : artworks.length,
  };
}
