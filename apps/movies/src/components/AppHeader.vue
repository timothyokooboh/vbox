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
    position="sticky"
    top="0"
    z-index="z-header"
    display="flex"
    flex-direction="column"
    :sm="{
      flexDirection: 'row',
      alignItems: 'center',
      paddingInline: 'var(--spacing-6)',
    }"
    justify-content="space-between"
    align-items="flex-start"
    gap="sp-2"
    px="sp-4"
    py="sp-3"
    bg="color-mix(in oklab, var(--color-canvas) 75%, transparent)"
    glass="blur(18px)"
    border-bottom="1px solid color-mix(in oklab, var(--color-ink) 12%, transparent)"
  >
    <router-link
      to="/"
      color="cl-brand"
      fs="clamp(1.55rem,8vw,2.4rem)"
      :sm="{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }"
      fw="900"
      ls="0.02em"
      text-decoration="none"
      lh="1"
      white-space="nowrap"
    >
      VBox Movies
    </router-link>

    <nav
      display="flex"
      align-items="center"
      gap="sp-2"
      :sm="{ gap: 'var(--spacing-3)', width: 'auto' }"
      flex-wrap="wrap"
      justify-content="space-between"
      row-gap="sp-2"
      width="100%"
      aria-label="Top navigation"
    >
      <p
        display="none"
        :md="{ display: 'block' }"
        color="color-mix(in oklab, var(--color-ink) 80%, transparent)"
        fs="fs-sm"
        m="0"
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
            bg="var(--color-canvas-soft)"
            color="cl-ink"
            border="1px solid color-mix(in oklab, var(--color-ink) 14%, transparent)"
            px="sp-3"
            py="sp-2"
            :sm="{ paddingInline: '0.875rem', paddingBlock: '0.625rem' }"
            border-radius="br-pill"
            cursor="pointer"
            fw="600"
            :hover="{
              backgroundColor:
                'color-mix(in oklab, var(--color-canvas-soft) 80%, white)',
            }"
          >
            Search
          </button>
        </DialogTrigger>

        <DialogPortal>
          <DialogOverlay
            vbox
            position="fixed"
            inset="0"
            bg="color-mix(in oklab, black 65%, transparent)"
            z="1000"
          >
          </DialogOverlay>
          <DialogContent
            vbox
            pos="fixed"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            w="min(62rem, 94vw)"
            max-h="84vh"
            overflow-y="auto"
            p="sp-5"
            bg="var(--color-canvas)"
            border="1px solid color-mix(in oklab, var(--color-ink) 16%, transparent)"
            border-radius="br-card"
            shadow="bs-card"
            z="1001"
          >
            <DialogTitle vbox fs="fs-xl" m="0" color="cl-ink"
              >Search Movies</DialogTitle
            >
            <DialogDescription
              vbox
              mt="sp-2"
              mb="sp-4"
              color="color-mix(in oklab, var(--color-ink) 70%, transparent)"
            >
              Find titles and jump into details.
            </DialogDescription>

            <label
              display="block"
              mb="sp-4"
              for="movie-search-input"
              color="cl-ink"
              fw="600"
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
              w="100%"
              bg="var(--color-canvas-soft)"
              color="cl-ink"
              border="1px solid color-mix(in oklab, var(--color-ink) 16%, transparent)"
              border-radius="br-card"
              px="sp-4"
              py="sp-3"
              :focus-visible="{ outline: '3px solid var(--color-ring)' }"
            />

            <section
              mt="sp-5"
              aria-live="polite"
              :aria-busy="searchQuery.isFetching.value"
            >
              <p v-if="searchQuery.isFetching.value" color="cl-ink" m="0">
                Searching...
              </p>

              <p
                v-else-if="
                  searchQuery.data.value &&
                  searchQuery.data.value.results.length === 0
                "
                color="cl-ink"
                m="0"
              >
                No matching movies found.
              </p>

              <div
                v-else-if="searchQuery.data.value"
                display="grid"
                gap="sp-4"
                grid-template-columns="repeat(auto-fill,minmax(11rem,1fr))"
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
                mt="sp-5"
                px="sp-3"
                py="sp-2"
                border="1px solid color-mix(in oklab, var(--color-ink) 14%, transparent)"
                border-radius="br-pill"
                bg="transparent"
                color="cl-ink"
                cursor="pointer"
              >
                Close
              </button>
            </DialogClose>
          </DialogContent>
        </DialogPortal>
      </DialogRoot>

      <label
        display="inline-flex"
        align-items="center"
        gap="sp-2"
        color="cl-ink"
      >
        <span fs="fs-sm">{{ isDark ? 'Dark' : 'Light' }}</span>
        <SwitchRoot :checked="isDark" @update:checked="toggleTheme" as-child>
          <button
            type="button"
            aria-label="Toggle color scheme"
            w="3rem"
            h="1.75rem"
            border-radius="br-pill"
            bg="color-mix(in oklab, var(--color-ink) 25%, transparent)"
            position="relative"
            border="1px solid color-mix(in oklab, var(--color-ink) 12%, transparent)"
            cursor="pointer"
          >
            <SwitchThumb
              vbox
              display="block"
              w="1.35rem"
              h="1.35rem"
              border-radius="999px"
              bg="cl-brand"
              transform="translateX(-3px)"
              transition="transform 200ms ease"
              :declarations="{
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
