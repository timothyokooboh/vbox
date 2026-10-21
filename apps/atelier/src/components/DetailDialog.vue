<script setup lang="ts">
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from 'radix-vue';
import type { Artwork } from '../api/artworks';
import ArtworkImage from './ArtworkImage.vue';
import AppButton from './AppButton.vue';
defineProps<{ artwork: Artwork | null; open: boolean }>();
defineEmits<{
  'update:open': [value: boolean];
  restoreFocus: [event: Event];
}>();
</script>
<template>
  <DialogRoot :open="open" @update:open="$emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay
        vb-position="fixed"
        vb-inset="0"
        vb-bg="rgb(8 20 12 / 75%)"
        vb-z-index="10"
      />
      <DialogContent
        v-if="artwork"
        @close-auto-focus="$emit('restoreFocus', $event)"
        vb-position="fixed"
        vb-top="50%"
        vb-left="50%"
        vb-transform="translate(-50%, -50%)"
        vb-width="min(68rem, calc(100vw - 2rem))"
        vb-max-height="90dvh"
        vb-overflow-y="auto"
        vb-overflow-wrap="anywhere"
        vb-z-index="11"
        vb-bg="cl-paper"
        vb-color="cl-ink"
        vb-padding="1.25rem"
        :vb-md="{ padding: '2rem' }"
        vb-border="1px solid cl-line"
      >
        <div
          vb-display="flex"
          vb-justify-content="space-between"
          vb-align-items="center"
          vb-gap="1rem"
          vb-margin-bottom="1.5rem"
        >
          <span vb-font-size="0.65rem" vb-letter-spacing="0.15em"
            >A CLOSER LOOK</span
          >
          <DialogClose as-child
            ><AppButton variant="outline" aria-label="Close artwork details"
              >Close <span aria-hidden="true">&#215;</span></AppButton
            ></DialogClose
          >
        </div>
        <div
          vb-display="grid"
          vb-grid-template-columns="minmax(0, 1fr)"
          vb-gap="2rem"
          :vb-md="{ gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)' }"
        >
          <div
            vb-min-width="0"
            vb-bg="cl-surface"
            vb-padding="1rem"
            vb-aspect-ratio="1 / 1"
            vb-max-height="65dvh"
          >
            <ArtworkImage :artwork="artwork" eager />
          </div>
          <div vb-min-width="0" vb-align-self="center">
            <DialogTitle
              vb-display-face="var(--font-display)"
              vb-font-size="clamp(2rem,4vw,3.5rem)"
              vb-font-weight="400"
              vb-line-height="1.05"
              vb-margin="0 0 1rem"
              vb-overflow-wrap="anywhere"
              >{{ artwork.title }}</DialogTitle
            >
            <DialogDescription
              vb-font-size="0.875rem"
              vb-line-height="1.7"
              vb-color="cl-muted"
              >{{ artwork.artist }}. {{ artwork.date }}.</DialogDescription
            >
            <dl
              vb-margin="2rem 0"
              vb-display="grid"
              vb-gap="1rem"
              vb-font-size="0.8rem"
            >
              <div>
                <dt vb-color="cl-muted">Medium</dt>
                <dd vb-margin="0.25rem 0 0">{{ artwork.medium }}</dd>
              </div>
              <div>
                <dt vb-color="cl-muted">Dimensions</dt>
                <dd vb-margin="0.25rem 0 0" vb-overflow-wrap="anywhere">
                  {{ artwork.dimensions }}
                </dd>
              </div>
            </dl>
            <p vb-font-size="0.7rem" vb-line-height="1.7" vb-color="cl-muted">
              {{ artwork.artist }}. {{ artwork.title }}, {{ artwork.date }}. The
              Art Institute of Chicago.
            </p>
            <!-- Explicit tabindex keeps these links in Safari's keyboard sequence. -->
            <a
              :href="artwork.source"
              tabindex="0"
              target="_blank"
              rel="noopener noreferrer"
              vb-display="inline-flex"
              vb-min-height="44px"
              vb-align-items="center"
              vb-color="cl-ink"
              vb-font-size="0.8rem"
              >View museum record</a
            >
            <p vb-font-size="0.7rem" vb-color="cl-muted">
              Museum-designated public domain.
              <a
                href="https://www.artic.edu/open-access/open-access-images"
                tabindex="0"
                target="_blank"
                rel="noopener noreferrer"
                >Image rights</a
              >.
            </p>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
