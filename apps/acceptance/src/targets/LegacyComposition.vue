<script setup lang="ts">
import { ref } from 'vue';
import { VBox } from '@veebox/vue';
const hover = ref<string | null>('blue');
const base = ref<string | null>('yellow');
</script>
<template>
  <section aria-label="Legacy and native composition">
    <button @click="hover = null">Withdraw legacy caller hover</button>
    <button @click="base = null">Withdraw legacy caller base</button>
    <VBox
      is="button"
      data-testid="legacy-composition"
      class="legacy-authored"
      color="white"
      bg="black"
      :hover="{ color: 'red', bg: 'purple' }"
      :vb="{ color: base }"
      :vb-hover="{ color: hover }"
      >Legacy composition</VBox
    >
  </section>
</template>
