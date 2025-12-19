<template>
  <v-box
    data-scope="banner-header"
    is="header"
    display="flex"
    justify-content="space-between"
    align-items="start"
    gap="0.8rem"
  >
    <v-box display="flex" align-items="center" gap="0.5rem">
      <!-- icon -->
      <v-box is="span" color="#821C1C" class="material-symbols-outlined">
        warning
      </v-box>

      <!-- title -->
      <v-box
        is="h2"
        fs="fs-sm"
        lh="lh-normal"
        my="0"
        color="#821C1C"
        text-wrap="pretty"
        class="vp-raw"
        :md="{
          fs: '1rem',
        }"
      >
        You’ve reached your free usage limit.
      </v-box>
    </v-box>

    <!-- close button -->
    <v-box
      is="button"
      display="flex"
      align-items="center"
      justify-content="center"
      h="1.4rem"
      w="1.4rem"
      radius="br-full"
      v-bind="outlineStyles"
    >
      <v-box
        is="span"
        color="rgba(0,0,0.9)"
        fs="1rem !important"
        class="material-symbols-outlined"
        transition="color 0.2s ease-in-out"
        :hover="{
          color: '#A22827',
        }"
      >
        close
      </v-box>
    </v-box>
  </v-box>
</template>

<script setup lang="ts">
import { outlineStyles } from '../style-utils';
</script>
