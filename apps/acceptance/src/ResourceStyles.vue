<script setup lang="ts">
import { ref } from 'vue';
const width = ref(20);
const mounted = ref(true);
</script>
<template>
  <section aria-label="Style resource exercise">
    <label>Resource width<input v-model.number="width" type="number" /></label>
    <button type="button" @click="mounted = !mounted">
      Toggle resource target
    </button>
    <p
      v-if="mounted"
      data-testid="resource-target"
      :vb="{ width: `${width}px`, color: 'red' }"
    >
      Resource target
    </p>
    <p data-testid="resource-shared" vb-width="20px" vb-color="red">
      Shared survivor
    </p>
  </section>
</template>
