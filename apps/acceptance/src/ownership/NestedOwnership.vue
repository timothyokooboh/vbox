<script setup lang="ts">
import { ref } from 'vue';
import { sharedStyles } from './styles';
import OwnedLayer from './OwnedLayer.vue';
const rootTag = ref<'button' | 'a'>('button');
const mounted = ref(true);
const reusedMounted = ref(true);
const outerBase = ref<string | null>('yellow');
const nearerBase = ref<string | undefined>('green');
const outerHover = ref<string | null>('blue');
const nearerHover = ref<string | undefined>('orange');
function restore() {
  outerBase.value = 'yellow';
  nearerBase.value = 'green';
  outerHover.value = 'blue';
  nearerHover.value = 'orange';
}
</script>
<template>
  <section aria-label="Nested style ownership">
    <button @click="outerBase = null">Withdraw outer base</button>
    <button @click="nearerBase = undefined">Withdraw nearer base</button>
    <button @click="outerHover = null">Withdraw outer hover</button>
    <button @click="nearerHover = undefined">Withdraw nearer hover</button>
    <button @click="restore">Restore nested styles</button>
    <button @click="rootTag = rootTag === 'button' ? 'a' : 'button'">
      Replace nested root
    </button>
    <button @click="mounted = !mounted">Toggle nested instance</button>
    <button @click="reusedMounted = !reusedMounted">
      Toggle reused instance
    </button>
    <output data-testid="nested-frozen-source">{{
      JSON.stringify(sharedStyles)
    }}</output>
    <OwnedLayer
      v-if="reusedMounted"
      data-testid="nested-reused-internal"
      :defaults="sharedStyles"
      :nearer="{ color: 'green', hover: { color: 'orange' } }"
      >Reused internal source</OwnedLayer
    >
    <OwnedLayer data-testid="nested-shared" :vb="sharedStyles"
      >Shared caller</OwnedLayer
    >
    <OwnedLayer
      v-if="mounted"
      :as="rootTag"
      data-testid="nested-owner"
      class="outer-caller"
      :nearer="{ color: nearerBase, hover: { color: nearerHover } }"
      :vb="{ color: outerBase, hover: { color: outerHover } }"
      >Nested styles</OwnedLayer
    >
  </section>
</template>
