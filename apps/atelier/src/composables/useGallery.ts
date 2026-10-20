import { computed, ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { searchArtworks, type Artwork } from '../api/artworks';

export function useGallery() {
  const draft = ref('');
  const submitted = ref('landscape');
  const selected = ref<Artwork | null>(null);
  const detailOpen = ref(false);
  let trigger: HTMLElement | null = null;
  const collection = useQuery({
    queryKey: computed(() => ['artworks', submitted.value]),
    queryFn: ({ signal }) => searchArtworks(submitted.value, signal),
    staleTime: 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
  function search(value = draft.value) {
    draft.value = value.trim();
    submitted.value = draft.value || 'landscape';
  }
  function inspect(artwork: Artwork, event: MouseEvent) {
    trigger =
      event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
    trigger?.focus({ preventScroll: true });
    selected.value = artwork;
    detailOpen.value = true;
  }
  function restoreFocus(event: Event) {
    event.preventDefault();
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
  }
  return {
    draft,
    submitted,
    selected,
    detailOpen,
    collection,
    search,
    inspect,
    restoreFocus,
  };
}
