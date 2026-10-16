<script setup lang="ts">
import { ref } from 'vue';
import SyntaxSlot from './SyntaxSlot.vue';
import OptionsFixture from './OptionsFixture.vue';
const rows = [
  { name: 'Ada', color: 'red' },
  { name: 'Lin', color: 'blue' },
];
const visible = ref(true);
const tick = ref(0);
let evaluations = 0;
const tone = (row: (typeof rows)[number]) => {
  evaluations++;
  return row.color;
};
const id = 'native-field';
const vbColor = 'green';
const field = ref<HTMLInputElement>();
const text = ref('Initial');
const dynamicName = 'aria-label';
const directClicks = ref(0);
const spreadClicks = ref(0);
const semantic = {
  class: 'authored',
  'vb-color': 'ordinary-runtime-key',
  onClick: () => spreadClicks.value++,
};
</script>
<template>
  <section vb-display="block" aria-label="Vue syntax fixture">
    <OptionsFixture />
    <button @click="tick++">Refresh styles</button>
    <button @click="visible = !visible">Toggle rows</button>
    <template v-if="visible">
      <template v-for="row in rows" :key="row.name">
        <button
          :aria-label="`Row ${row.name}`"
          :vb-color="tone(row)"
          :vb-width="`${20 + tick}px`"
        >
          {{ row.name }}
        </button>
      </template>
    </template>
    <p v-else data-testid="branch-fallback">Rows hidden</p>
    <output data-testid="evaluations">{{ evaluations }}</output>
    <input
      :id
      ref="field"
      v-model="text"
      :[dynamicName]="'Native field'"
      translate="no"
      :vb-color
    />
    <output data-testid="model-value">{{ text }}</output>
    <button @click="field?.focus()">Focus field</button>
    <button
      data-testid="semantic-spread"
      v-bind="semantic"
      vb-width="40px"
      @click="directClicks++"
    >
      Merged listeners
    </button>
    <output data-testid="listener-values"
      >{{ spreadClicks }} / {{ directClicks }}</output
    >
    <SyntaxSlot v-slot="{ tone }"
      ><p data-testid="scoped-color" :vb-color="tone">
        Scoped value
      </p></SyntaxSlot
    >
    <p data-testid="quoted" title="A < B > C { D }" vb-font-size="14px">
      Hello &amp; goodbye
    </p>
    <!-- <p vb-color="purple">Comment only</p> -->
    <svg width="20" height="20" aria-label="Stroke fixture">
      <path data-testid="svg-path" d="M0 0L20 20" vb-stroke="red" />
    </svg>
  </section>
</template>
