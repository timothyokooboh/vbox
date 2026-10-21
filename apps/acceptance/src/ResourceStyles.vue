<script setup lang="ts">
import { ref } from 'vue';
const width = ref(20);
const mounted = ref(true);
const contributing = ref(true);
</script>
<template>
  <section aria-label="Style resource exercise">
    <label>Resource width<input v-model.number="width" type="number" /></label>
    <button type="button" @click="mounted = !mounted">
      Toggle resource target
    </button>
    <button type="button" @click="contributing = !contributing">
      Toggle resource contribution
    </button>
    <v-box
      is="p"
      color="black"
      width="10px"
      v-if="mounted"
      data-testid="resource-target"
      :vb="contributing ? { width: `${width}px`, color: 'red' } : null"
    >
      Resource target
    </v-box>
    <v-box
      is="p"
      color="black"
      width="10px"
      data-testid="resource-shared"
      :vb="{ width: '20px', color: 'red' }"
    >
      Shared survivor
    </v-box>
  </section>
</template>
