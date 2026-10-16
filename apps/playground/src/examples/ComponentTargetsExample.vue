<script setup lang="ts">
import { ref } from 'vue';
import ForwardedButton from './ForwardedButton.vue';
import VariantButton from './VariantButton.vue';

const color = ref<string | null>('yellow');
const variant = ref<'solid' | 'outline'>('solid');
const clicks = ref(0);
</script>

<template>
  <section aria-labelledby="target-heading">
    <h2 id="target-heading">Component targets and PVA</h2>
    <p>
      A single root uses ordinary class fallthrough. A fragment explicitly
      forwards $attrs to its chosen button; VBox adds no wrapper and guesses no
      target.
    </p>
    <div
      vb-display="flex"
      vb-align-items="center"
      vb-flex-wrap="wrap"
      vb-gap="12px"
    >
      <VariantButton
        data-testid="playground-single"
        :variant="variant"
        :vb-color="color"
        @click="clicks++"
        >Single root</VariantButton
      >
      <ForwardedButton
        data-testid="playground-fragment"
        :variant="variant"
        :vb-color="color"
        @click="clicks++"
        >Explicit fragment target</ForwardedButton
      >
    </div>
    <p>
      Target clicks:
      <output data-testid="playground-target-clicks">{{ clicks }}</output>
    </p>
    <button type="button" @click="color = null">Withdraw parent color</button>
    <button type="button" @click="variant = 'outline'">
      Use outline variant
    </button>
    <p>
      The variant is an ordinary component prop. PVA produces a style object;
      the child attaches it with :vb. Parent yellow changes resting color, not
      the child's red hover.
    </p>
  </section>
</template>
