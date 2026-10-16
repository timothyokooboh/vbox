<script setup lang="ts">
import ConditionsExample from './ConditionsExample.vue';
import ComponentTargetsExample from './ComponentTargetsExample.vue';
import CompositionExample from './CompositionExample.vue';
import { ref } from 'vue';
import type { VBoxStyles } from '@veebox/core';

const clicks = ref(0);
const semanticButton = { type: 'button' as const, translate: 'no' as const };
const movement: VBoxStyles = { translate: '8px' };
</script>

<template>
  <section
    aria-labelledby="native-api-heading"
    vb-p="sp-6"
    vb-bg="#f7f8fa"
    vb-color="#151b22"
    vb-border-radius="br-lg"
    vb-margin="sp-4"
  >
    <h1 id="native-api-heading" vb-m="0 0 sp-3">Explicit native styling</h1>
    <p>
      Ordinary bindings keep their HTML or component meaning. VBox styling uses
      <code>vb-*</code> or <code>:vb</code>.
    </p>
    <div
      vb-display="flex"
      vb-gap="sp-6"
      vb-align-items="center"
      vb-flex-wrap="wrap"
    >
      <div>
        <button
          v-bind="semanticButton"
          :vb="movement"
          data-testid="playground-translate"
          @click="clicks++"
          vb-p="sp-3"
          vb-border="1px solid currentColor"
          vb-border-radius="br-md"
        >
          Semantic translate="no", CSS translate="8px"
        </button>
        <p>
          Clicks: <output data-testid="playground-clicks">{{ clicks }}</output>
        </p>
      </div>
      <figure vb-m="0">
        <img
          data-testid="playground-dimensions"
          src="/native-dimensions.svg"
          alt="A geometric illustration with independent intrinsic and styled dimensions"
          width="160"
          height="80"
          vb-width="240px"
          vb-height="120px"
          vb-border-radius="br-lg"
        />
        <figcaption>HTML 160 x 80; VBox 240 x 120.</figcaption>
      </figure>
    </div>
    <CompositionExample />
    <ConditionsExample />
    <ComponentTargetsExample />
  </section>
</template>
