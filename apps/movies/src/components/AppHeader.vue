<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  SwitchRoot,
  SwitchThumb,
} from 'radix-vue';
import { debounce } from 'lodash-es';
import { storeToRefs } from 'pinia';
import { onBeforeUnmount, ref, watch } from 'vue';
import { tmdbApi } from '../api/tmdb';
import { useTheme } from '../composables/useTheme';
import { useMovieSearchQuery } from '../composables/useTmdbQueries';
import { useUiStore } from '../stores/ui';
import MovieCard from './MovieCard.vue';

const uiStore = useUiStore();
const { searchOpen, searchValue } = storeToRefs(uiStore);
const { setSearchOpen, setSearchValue } = uiStore;

const { isDark, toggleTheme } = useTheme();
const debouncedSearchValue = ref(searchValue.value);
const updateDebouncedSearch = debounce((value: string) => {
  debouncedSearchValue.value = value;
}, 1500);

watch(searchValue, (value) => {
  updateDebouncedSearch(value);
});

onBeforeUnmount(() => {
  updateDebouncedSearch.cancel();
});

const searchQuery = useMovieSearchQuery(debouncedSearchValue);
</script>

<template>
  <header
    vb-position="sticky"
    vb-top="0"
    vb-z-index="z-header"
    vb-display="flex"
    vb-flex-direction="column"
    :vb-sm="{
      flexDirection: 'row',
      alignItems: 'center',
      paddingInline: 'var(--spacing-6)',
    }"
    vb-justify-content="space-between"
    vb-align-items="flex-start"
    vb-gap="sp-2"
    vb-px="sp-4"
    vb-py="sp-3"
    vb-bg="color-mix(in oklab, var(--color-canvas) 75%, transparent)"
    vb-glass="blur(18px)"
    vb-border-bottom="1px solid color-mix(in oklab, var(--color-ink) 12%, transparent)"
  >
    <router-link
      to="/"
      vb-color="cl-brand"
      vb-fs="clamp(1.55rem,8vw,2.4rem)"
      :vb-sm="{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }"
      vb-fw="900"
      vb-ls="0.02em"
      vb-text-decoration="none"
      vb-lh="1"
      vb-white-space="nowrap"
    >
      VBox Movies
    </router-link>

    <nav
      vb-display="flex"
      vb-align-items="center"
      vb-gap="sp-2"
      :vb-sm="{ gap: 'var(--spacing-3)', width: 'auto' }"
      vb-flex-wrap="wrap"
      vb-justify-content="space-between"
      vb-row-gap="sp-2"
      vb-width="100%"
      aria-label="Top navigation"
    >
      <p
        vb-display="none"
        :vb-md="{ display: 'block' }"
        vb-color="color-mix(in oklab, var(--color-ink) 80%, transparent)"
        vb-fs="fs-sm"
        vb-m="0"
      >
        {{
          tmdbApi.hasApiKey
            ? 'Live TMDB data'
            : 'Mock data (set VITE_TMDB_API_KEY)'
        }}
      </p>

      <DialogRoot v-model:open="searchOpen">
        <DialogTrigger as-child>
          <button
            type="button"
            aria-label="Open movie search"
            vb-bg="var(--color-canvas-soft)"
            vb-color="cl-ink"
            vb-border="1px solid color-mix(in oklab, var(--color-ink) 14%, transparent)"
            vb-px="sp-3"
            vb-py="sp-2"
            :vb-sm="{ paddingInline: '0.875rem', paddingBlock: '0.625rem' }"
            vb-border-radius="br-pill"
            vb-cursor="pointer"
            vb-fw="600"
            :vb-hover="{
              backgroundColor:
                'color-mix(in oklab, var(--color-canvas-soft) 80%, white)',
            }"
          >
            Search
          </button>
        </DialogTrigger>

        <DialogPortal>
          <DialogOverlay
            vb-position="fixed"
            vb-inset="0"
            vb-bg="color-mix(in oklab, black 65%, transparent)"
            vb-z-index="1000"
          >
          </DialogOverlay>
          <DialogContent
            vb-pos="fixed"
            vb-top="50%"
            vb-left="50%"
            vb-transform="translate(-50%, -50%)"
            vb-w="min(62rem, 94vw)"
            vb-max-h="84vh"
            vb-overflow-y="auto"
            vb-p="sp-5"
            vb-bg="var(--color-canvas)"
            vb-border="1px solid color-mix(in oklab, var(--color-ink) 16%, transparent)"
            vb-border-radius="br-card"
            vb-shadow="bs-card"
            vb-z-index="1001"
          >
            <DialogTitle vb-fs="fs-xl" vb-m="0" vb-color="cl-ink"
              >Search Movies</DialogTitle
            >
            <DialogDescription
              vb-mt="sp-2"
              vb-mb="sp-4"
              vb-color="color-mix(in oklab, var(--color-ink) 70%, transparent)"
            >
              Find titles and jump into details.
            </DialogDescription>

            <label
              vb-display="block"
              vb-mb="sp-4"
              for="movie-search-input"
              vb-color="cl-ink"
              vb-fw="600"
            >
              Search Query
            </label>
            <input
              id="movie-search-input"
              :value="searchValue"
              @input="setSearchValue(($event.target as HTMLInputElement).value)"
              type="search"
              autocomplete="off"
              placeholder="Try: Dune, Batman, Matrix..."
              vb-w="100%"
              vb-bg="var(--color-canvas-soft)"
              vb-color="cl-ink"
              vb-border="1px solid color-mix(in oklab, var(--color-ink) 16%, transparent)"
              vb-border-radius="br-card"
              vb-px="sp-4"
              vb-py="sp-3"
              :vb-focus-visible="{ outline: '3px solid var(--color-ring)' }"
            />

            <section
              vb-mt="sp-5"
              aria-live="polite"
              :aria-busy="searchQuery.isFetching.value"
            >
              <p v-if="searchQuery.isFetching.value" vb-color="cl-ink" vb-m="0">
                Searching...
              </p>

              <p
                v-else-if="
                  searchQuery.data.value &&
                  searchQuery.data.value.results.length === 0
                "
                vb-color="cl-ink"
                vb-m="0"
              >
                No matching movies found.
              </p>

              <div
                v-else-if="searchQuery.data.value"
                vb-display="grid"
                vb-gap="sp-4"
                vb-grid-template-columns="repeat(auto-fill,minmax(11rem,1fr))"
              >
                <MovieCard
                  v-for="movie in searchQuery.data.value.results.slice(0, 12)"
                  :key="movie.id"
                  :movie="movie"
                  @select="setSearchOpen(false)"
                />
              </div>
            </section>

            <DialogClose as-child>
              <button
                type="button"
                vb-mt="sp-5"
                vb-px="sp-3"
                vb-py="sp-2"
                vb-border="1px solid color-mix(in oklab, var(--color-ink) 14%, transparent)"
                vb-border-radius="br-pill"
                vb-bg="transparent"
                vb-color="cl-ink"
                vb-cursor="pointer"
              >
                Close
              </button>
            </DialogClose>
          </DialogContent>
        </DialogPortal>
      </DialogRoot>

      <label
        vb-display="inline-flex"
        vb-align-items="center"
        vb-gap="sp-2"
        vb-color="cl-ink"
      >
        <span vb-fs="fs-sm">{{ isDark ? 'Dark' : 'Light' }}</span>
        <SwitchRoot :checked="isDark" @update:checked="toggleTheme" as-child>
          <button
            type="button"
            aria-label="Toggle color scheme"
            vb-w="3rem"
            vb-h="1.75rem"
            vb-border-radius="br-pill"
            vb-bg="color-mix(in oklab, var(--color-ink) 25%, transparent)"
            vb-position="relative"
            vb-border="1px solid color-mix(in oklab, var(--color-ink) 12%, transparent)"
            vb-cursor="pointer"
          >
            <SwitchThumb
              vb-display="block"
              vb-w="1.35rem"
              vb-h="1.35rem"
              vb-border-radius="999px"
              vb-bg="cl-brand"
              vb-transform="translateX(-3px)"
              vb-transition="transform 5s ease"
              :vb-declarations="{
                '&[data-state=checked]': {
                  transform: 'translateX(16px)',
                },
              }"
            >
            </SwitchThumb>
          </button>
        </SwitchRoot>
      </label>
    </nav>
  </header>
</template>
