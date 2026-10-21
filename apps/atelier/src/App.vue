<script setup lang="ts">
import { useDark } from '@vueuse/core';
import { SwitchRoot } from 'radix-vue';
import { useGallery } from './composables/useGallery';
import AppButton from './components/AppButton.vue';
import ArtworkCard from './components/ArtworkCard.vue';
import DetailDialog from './components/DetailDialog.vue';
import GalleryHero from './components/GalleryHero.vue';
const isDark = useDark({ storageKey: 'atelier-theme' });
const {
  draft,
  submitted,
  selected,
  detailOpen,
  collection,
  search,
  inspect,
  restoreFocus,
} = useGallery();
const suggestions = ['Monet', 'Hokusai', 'Flowers'];
</script>
<template>
  <div
    vb-min-height="100dvh"
    vb-overflow-wrap="anywhere"
    vb-bg="radial-gradient(ellipse at top left, color-mix(in oklab, var(--color-surface) 65%, transparent), transparent 65%), var(--color-paper)"
    vb-color="cl-ink"
  >
    <a
      href="#main-content"
      tabindex="0"
      vb-position="absolute"
      vb-top="-5rem"
      vb-left="1rem"
      vb-z-index="20"
      vb-padding="1rem"
      vb-bg="cl-ink"
      vb-color="cl-paper"
      :vb-focus-visible="{ top: '1rem' }"
      >Skip to content</a
    >
    <div
      vb-max-width="90rem"
      vb-margin="0 auto"
      vb-padding="0 1.25rem"
      :vb-md="{ paddingInline: '3rem' }"
      :vb-xl="{ paddingInline: '5rem' }"
    >
      <header
        vb-display="flex"
        vb-justify-content="space-between"
        vb-align-items="center"
        vb-gap="1rem"
        vb-padding="1.5rem 0"
        vb-border-bottom="1px solid cl-line"
      >
        <a
          href="#"
          aria-label="Atelier home"
          vb-display-face="var(--font-display)"
          vb-font-size="2.7rem"
          vb-line-height="1"
          vb-letter-spacing="-0.06em"
          vb-text-decoration="none"
          vb-color="cl-ink"
          >atelier<span vb-color="cl-clay">.</span></a
        >
        <nav
          aria-label="Main navigation"
          vb-display="flex"
          vb-align-items="center"
          vb-gap="1.5rem"
        >
          <a
            href="#sources"
            vb-display="none"
            :vb-sm="{ display: 'inline-flex' }"
            vb-color="cl-muted"
            vb-font-size="0.75rem"
            vb-min-height="44px"
            vb-align-items="center"
            >About the collection</a
          >
          <SwitchRoot
            :checked="isDark"
            @update:checked="isDark = $event"
            as-child
          >
            <AppButton
              variant="outline"
              aria-label="Dark theme"
              vb-min-width="6rem"
              ><span aria-hidden="true">{{ isDark ? '\u25d0' : '\u25d1' }}</span
              >{{ isDark ? 'Dark' : 'Light' }}</AppButton
            >
          </SwitchRoot>
        </nav>
      </header>
      <main id="main-content" tabindex="-1" vb-outline="none">
        <GalleryHero :artwork="collection.data.value?.artworks[0]" />
        <section
          id="collection"
          aria-labelledby="collection-title"
          vb-padding="2.5rem 0 5rem"
          vb-border-top="1px solid cl-line"
          vb-scroll-margin-top="2rem"
        >
          <div
            vb-display="grid"
            vb-gap="1.5rem"
            :vb-md="{ gridTemplateColumns: '1fr 1fr', alignItems: 'end' }"
          >
            <div>
              <p
                vb-font-size="0.65rem"
                vb-letter-spacing="0.15em"
                vb-color="cl-clay"
                vb-margin="0 0 0.75rem"
              >
                THE OPEN COLLECTION
              </p>
              <h2
                id="collection-title"
                vb-display-face="var(--font-display)"
                vb-font-size="clamp(2.3rem,4vw,3.4rem)"
                vb-font-weight="400"
                vb-letter-spacing="-0.03em"
                vb-margin="0"
              >
                Find your next pause.
              </h2>
            </div>
            <form
              role="search"
              @submit.prevent="search()"
              vb-display="flex"
              vb-gap="0.5rem"
              vb-flex-wrap="wrap"
            >
              <label
                for="art-search"
                vb-width="100%"
                vb-font-size="0.7rem"
                vb-color="cl-muted"
                >Search art or artists</label
              >
              <input
                id="art-search"
                v-model="draft"
                type="search"
                maxlength="100"
                placeholder="An artist, a place, a feeling..."
                vb-flex="1 1 10rem"
                vb-min-width="0"
                vb-min-height="48px"
                vb-padding="0.75rem 1rem"
                vb-bg="cl-paper"
                vb-border="1px solid cl-line"
                vb-color="cl-ink"
                vb-font-family="inherit"
                vb-font-size="0.875rem"
                vb-border-radius="br-pill"
              />
              <AppButton type="submit" aria-label="Search collection"
                >Search <span aria-hidden="true">&#8599;</span></AppButton
              >
            </form>
          </div>
          <div
            vb-display="flex"
            vb-flex-wrap="wrap"
            vb-gap="0.5rem"
            vb-align-items="center"
            vb-margin="1.5rem 0 2rem"
          >
            <span
              vb-font-size="0.7rem"
              vb-color="cl-muted"
              vb-margin-right="0.5rem"
              >A place to start</span
            >
            <AppButton
              v-for="suggestion in suggestions"
              :key="suggestion"
              variant="outline"
              :aria-pressed="submitted === suggestion"
              @click="search(suggestion)"
              :vb="
                submitted === suggestion
                  ? { bg: 'cl-brand', color: 'cl-onBrand' }
                  : null
              "
              >{{ suggestion }}</AppButton
            >
          </div>
          <p
            v-if="collection.isPending.value"
            role="status"
            aria-label="Loading artworks"
            vb-color="cl-muted"
          >
            Finding something worth a closer look...
          </p>
          <div
            v-if="collection.isError.value"
            role="status"
            vb-padding="2rem"
            vb-bg="cl-surface"
          >
            <h3 vb-margin="0 0 1rem">The collection is taking a moment.</h3>
            <p>We could not reach the museum. Please try again.</p>
            <AppButton @click="collection.refetch()">Try again</AppButton>
          </div>
          <template v-if="collection.data.value">
            <p
              role="status"
              vb-font-size="0.7rem"
              vb-color="cl-muted"
              vb-margin="0 0 1.5rem"
            >
              Showing {{ collection.data.value.artworks.length }} of
              {{ collection.data.value.total }} museum matches for “{{
                submitted
              }}”.
            </p>
            <div
              v-if="collection.data.value.artworks.length"
              vb-display="grid"
              vb-grid-template-columns="1fr"
              :vb-sm="{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }"
              :vb-lg="{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }"
              vb-gap="2.5rem 1.5rem"
            >
              <ArtworkCard
                v-for="(artwork, index) in collection.data.value.artworks"
                :key="artwork.id"
                :artwork="artwork"
                :index="index"
                @inspect="inspect"
              />
            </div>
            <div v-else vb-padding="2rem" vb-bg="cl-surface">
              <h3>No artworks found.</h3>
              <p>Try an artist or a different title.</p>
              <AppButton @click="search('')">Reset search</AppButton>
            </div>
          </template>
        </section>
      </main>
      <footer
        id="sources"
        vb-border-top="1px solid cl-line"
        vb-padding="2rem 0 3rem"
        vb-display="flex"
        vb-flex-wrap="wrap"
        vb-justify-content="space-between"
        vb-gap="1rem"
        vb-color="cl-muted"
        vb-font-size="0.7rem"
        vb-line-height="1.8"
      >
        <p vb-margin="0">A little room for wonder. Built with VBox.</p>
        <p vb-margin="0" vb-max-width="30rem">
          Art and metadata from
          <a
            href="https://www.artic.edu"
            target="_blank"
            rel="noopener noreferrer"
            >artic.edu</a
          >. Independent demo; not affiliated with the museum. Public-domain
          designations belong to the source records.
        </p>
      </footer>
    </div>
    <DetailDialog
      v-model:open="detailOpen"
      :artwork="selected"
      @restore-focus="restoreFocus"
    />
  </div>
</template>
