<script setup lang="ts">
import { shallowRef } from 'vue';
import type { VBoxStyleInput } from '@veebox/core';
import OwnedLayer from './OwnedLayer.vue';
const initial = Object.freeze({
  opacity: 0,
  padding: '12px',
  declarations: Object.freeze({
    '&.selected': Object.freeze({ color: 'yellow' }),
  }),
});
const styles = shallowRef<VBoxStyleInput>(initial);
</script>
<template>
  <section aria-label="Nested declaration updates">
    <button @click="styles = { opacity: 'initial', padding: 'initial' }">
      Reset nested declarations
    </button>
    <button
      @click="
        styles = {
          opacity: null,
          padding: undefined,
          declarations: { '&.selected': null },
        }
      "
    >
      Withdraw nested declarations
    </button>
    <button @click="styles = initial">Restore nested declarations</button>
    <OwnedLayer
      class="selected"
      data-testid="nested-numeric"
      :defaults="{ declarations: { '&.selected': { color: 'white' } } }"
      :nearer="{
        opacity: 0.4,
        paddingLeft: '20px',
        declarations: { '&.selected': { color: 'green' } },
      }"
      :vb="styles"
      >Numeric ownership</OwnedLayer
    >
  </section>
</template>
