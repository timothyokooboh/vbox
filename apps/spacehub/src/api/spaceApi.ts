import type { ApodItem, LaunchApiResponse, LaunchResult, NeoApiResponse, NeoObject } from '@/types/space';

const NASA_KEY = 'DEMO_KEY';

const withTimeout = async <T>(promise: Promise<T>, ms = 8000): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);

  try {
    const response = await promise;
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await withTimeout(fetch(url));
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
};

const APOD_FALLBACK: ApodItem[] = [
  {
    date: '2026-01-10',
    title: 'Aurora Over Lunar Ridge',
    explanation: 'A synthetic fallback image used when NASA APOD is unavailable.',
    media_type: 'image',
    url: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000104/GSFC_20171208_Archive_e000104~orig.jpg',
  },
  {
    date: '2026-01-09',
    title: 'Deep-Sky Survey Field',
    explanation: 'Dense star field with nebula highlights.',
    media_type: 'image',
    url: 'https://images-assets.nasa.gov/image/PIA12235/PIA12235~orig.jpg',
  },
  {
    date: '2026-01-08',
    title: 'Spiral Galaxy Composite',
    explanation: 'Composite image in visible and infrared frequencies.',
    media_type: 'image',
    url: 'https://images-assets.nasa.gov/image/PIA01322/PIA01322~orig.jpg',
  },
];

const LAUNCH_FALLBACK: LaunchResult[] = [
  {
    id: 'demo-launch-1',
    name: 'Aquila-7 Test Mission',
    net: '2026-04-15T11:30:00Z',
    status: { name: 'Go for Launch', abbrev: 'Go' },
    launch_service_provider: { name: 'Orbital Systems' },
    pad: { name: 'LC-39A', location: { name: 'Kennedy Space Center', country_code: 'US' } },
    image: 'https://images-assets.nasa.gov/image/KSC-20210422-PH-KLS02_0098/KSC-20210422-PH-KLS02_0098~orig.jpg',
    mission: { type: 'Resupply', description: 'Resupply mission to the International Space Station.' },
  },
  {
    id: 'demo-launch-2',
    name: 'Europa Mapper Orbiter',
    net: '2026-05-03T07:10:00Z',
    status: { name: 'To Be Determined', abbrev: 'TBD' },
    launch_service_provider: { name: 'Deep Space Alliance' },
    pad: { name: 'SLC-4E', location: { name: 'Vandenberg', country_code: 'US' } },
    image: 'https://images-assets.nasa.gov/image/PIA19048/PIA19048~orig.jpg',
    mission: { type: 'Planetary Science', description: 'Orbiter dedicated to Europa surface and plume mapping.' },
  },
];

export const getApodGallery = async (count = 8): Promise<ApodItem[]> => {
  try {
    const list = await fetchJson<ApodItem[]>(
      `https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}&count=${count}`,
    );
    return list.filter((item) => item.media_type === 'image');
  } catch {
    return APOD_FALLBACK;
  }
};

export const getUpcomingLaunches = async (limit = 10): Promise<LaunchResult[]> => {
  try {
    const response = await fetchJson<LaunchApiResponse>(
      `https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=${limit}`,
    );
    return response.results;
  } catch {
    return LAUNCH_FALLBACK;
  }
};

export const getNearEarthObjects = async (): Promise<NeoObject[]> => {
  const today = new Date();
  const start = today.toISOString().slice(0, 10);
  const endDate = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  try {
    const response = await fetchJson<NeoApiResponse>(
      `https://api.nasa.gov/neo/rest/v1/feed?api_key=${NASA_KEY}&start_date=${start}&end_date=${endDate}`,
    );

    return Object.values(response.near_earth_objects)
      .flat()
      .slice(0, 12);
  } catch {
    return [];
  }
};
