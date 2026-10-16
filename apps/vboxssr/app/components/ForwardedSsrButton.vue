<script setup lang="ts">
defineOptions({ inheritAttrs: false });
</script>

<template>
  <span
    id="nuxt-forwarded-note"
    data-testid="nuxt-forwarded-note"
    vb-color="#505050"
    >A fragment explicitly chooses its button as the style target.</span
  >
  <button
    v-bind="$attrs"
    type="button"
    aria-describedby="nuxt-forwarded-note"
    vb-color="white"
    vb-bg="black"
    vb-padding="12px"
    :vb-hover="{ color: 'red' }"
  >
    <slot />
  </button>
</template>
