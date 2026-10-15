<script setup lang="ts">
import { ref } from 'vue';
import PropConsumer from './PropConsumer.vue';
const width = ref(35);
const input = ref<HTMLInputElement>();
const semanticBag = {
  title: 'Spread title',
  translate: 'no' as const,
  'vb-width': '999px',
};
const runtimeName = 'vb-height';
const items = [
  { id: 1, width: 21 },
  { id: 2, width: 42 },
];
let evaluations = 0;
const evaluateColor = () => {
  evaluations++;
  return 'red';
};
function reportEvaluations(event: MouseEvent) {
  (event.currentTarget as HTMLElement).dataset.calls = String(evaluations);
}
</script>
<template>
  <section>
    <p
      data-testid="scalar"
      :vb-color="evaluateColor()"
      :vb-width="width + 'px'"
      class="authored-class"
      style="border-top: 2px solid black"
    >
      Native scalar
    </p>
    <button type="button" @click="width = 80">Resize native</button>
    <button type="button" @click="reportEvaluations">Expression calls</button>
    <input
      ref="input"
      data-testid="semantic-input"
      width="12"
      height="7"
      translate="no"
      :vb-width="width + 'px'"
      vb-height="20px"
      vb-translate="8px 0"
      aria-label="Native input"
    />
    <button type="button" @click="input?.focus()">Focus native</button>
    <svg
      data-testid="semantic-svg"
      width="200"
      height="30"
      vb-width="90px"
      vb-height="25px"
      viewBox="0 0 200 30"
    >
      <rect
        data-testid="svg-fill"
        width="100"
        height="20"
        fill="blue"
        vb-fill="red"
      />
    </svg>
    <div
      data-testid="spread"
      v-bind="semanticBag"
      :[runtimeName]="'22px'"
      vb-color="blue"
    >
      Semantic spread
    </div>
    <PropConsumer color="tomato" size="lg" />
    <p
      data-testid="camel"
      vbColor="purple"
      vb-font-size="18px"
      vb-future-css-property="enabled"
      vbcolor="semantic"
    >
      Camel spelling
    </p>
    <template v-for="item in items" :key="item.id">
      <p
        v-if="item.width > 0"
        :data-testid="'scoped-' + item.id"
        :vb-width="item.width + 'px'"
      >
        Scoped expression
      </p>
    </template>
  </section>
</template>
