<script setup lang="ts">
defineProps<{
  title?: string;
  subtitle?: string;
}>();
</script>

<template>
  <article
    bg="var(--color-surface)"
    border="1px solid color-mix(in oklab, var(--color-ink) 12%, transparent)"
    border-radius="br-lg"
    p="sp-4"
    shadow="bs-card"
    display="flex"
    flex-direction="column"
    gap="sp-3"
  >
    <header v-if="title || subtitle" display="flex" flex-direction="column" gap="sp-1">
      <h3 v-if="title" m="0" color="cl-ink" fs="fs-lg" fw="700">{{ title }}</h3>
      <p
        v-if="subtitle"
        m="0"
        fs="fs-sm"
        color="color-mix(in oklab, var(--color-ink) 70%, transparent)"
      >
        {{ subtitle }}
      </p>
    </header>

    <slot />
  </article>
</template>
