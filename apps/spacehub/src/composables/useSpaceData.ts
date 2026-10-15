import { onMounted, ref } from 'vue';
import { getApodGallery, getNearEarthObjects, getUpcomingLaunches } from '@/api/spaceApi';
import type { ApodItem, LaunchResult, NeoObject } from '@/types/space';

export const useSpaceData = () => {
  const loading = ref(true);
  const error = ref<string | null>(null);
  const apodItems = ref<ApodItem[]>([]);
  const launches = ref<LaunchResult[]>([]);
  const neos = ref<NeoObject[]>([]);

  const load = async () => {
    loading.value = true;
    error.value = null;

    try {
      const [apod, upcoming, asteroids] = await Promise.all([
        getApodGallery(10),
        getUpcomingLaunches(8),
        getNearEarthObjects(),
      ]);

      apodItems.value = apod;
      launches.value = upcoming;
      neos.value = asteroids;
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : 'Failed to load data.';
    } finally {
      loading.value = false;
    }
  };

  onMounted(load);

  return {
    loading,
    error,
    apodItems,
    launches,
    neos,
    reload: load,
  };
};
