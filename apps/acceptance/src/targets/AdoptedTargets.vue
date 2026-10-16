<script setup lang="ts">
import { ref } from 'vue';
import { VBox } from '@veebox/vue';
const tag = ref<'button' | 'a'>('button');
const adopt = ref(true);
const lateAdopt = ref(false);
const multiple = ref(false);
const label = ref('First child');
const childClicks = ref(0);
const parentClicks = ref(0);
const child = ref<HTMLElement>();
</script>
<template>
  <section aria-label="Adopted targets">
    <button @click="tag = tag === 'button' ? 'a' : 'button'">
      Change adopted tag
    </button>
    <button @click="label = 'Updated child'">Update adopted slot</button>
    <button @click="adopt = !adopt">Toggle adoption</button>
    <button @click="child?.focus()">Focus adopted ref</button>
    <button @click="lateAdopt = true">Enable late adoption</button>
    <button @click="multiple = !multiple">
      Toggle multiple adopted children
    </button>
    <VBox
      :as-child="lateAdopt"
      is="section"
      class="late-parent"
      vb-color="yellow"
    >
      <button data-testid="late-child">Late child</button>
    </VBox>
    <VBox as-child vb-color="yellow">
      <button data-testid="constrained-child">Required child</button>
      <button v-if="multiple" data-testid="extra-child">Extra child</button>
    </VBox>
    <output data-testid="adopted-events"
      >{{ childClicks }} / {{ parentClicks }}</output
    >
    <VBox
      :as-child="adopt"
      is="section"
      color="purple"
      class="adopted-parent"
      :style="{ fontStyle: 'italic' }"
      vb-padding="4px"
      @click="parentClicks++"
      ><component
        :is="tag"
        ref="child"
        href="#adopted"
        tabindex="0"
        data-testid="adopted-child"
        class="adopted-child"
        @click="childClicks++"
        >{{ label }}</component
      ></VBox
    >
  </section>
</template>
