<template>
  <header
    data-scope="banner-header"
    vb-display="flex"
    vb-justify-content="space-between"
    vb-align-items="start"
    vb-gap="0.8rem"
  >
    <div vb-display="flex" vb-align-items="center" vb-gap="0.5rem">
      <!-- icon -->
      <span vb-color="#821C1C" class="material-symbols-outlined">
        warning
      </span>

      <!-- title -->
      <h2
        vb-fs="fs-sm"
        vb-lh="lh-normal"
        vb-my="0"
        vb-color="#821C1C"
        vb-text-wrap="pretty"
        class="vp-raw"
        :vb-md="{
          fs: '1rem',
        }"
      >
        You’ve reached your free usage limit.
      </h2>
    </div>

    <!-- close button -->
    <button
      vb-display="flex"
      vb-align-items="center"
      vb-justify-content="center"
      vb-h="1.4rem"
      vb-w="1.4rem"
      vb-radius="br-full"
      :vb="outlineStyles"
    >
      <span
        vb-color="rgba(0,0,0.9)"
        vb-fs="1rem !important"
        class="material-symbols-outlined"
        vb-transition="color 0.2s ease-in-out"
        :vb-hover="{
          color: '#A22827',
        }"
      >
        close
      </span>
    </button>
  </header>
</template>

<script setup lang="ts">
import { outlineStyles } from '../style-utils';
</script>
