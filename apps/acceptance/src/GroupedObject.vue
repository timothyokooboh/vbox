<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { pva, type VariantProps } from '@veebox/property-variance-authority';
import type { VBoxStyleProps, VBoxStyles } from '@veebox/core';
const initial: VBoxStyleProps = Object.freeze({
  color: 'red',
  translate: '8px',
  opacity: 0.5,
});
const styles = shallowRef<VBoxStyles | null | undefined>(initial);
const replace = () => {
  styles.value = { color: 'blue', translate: '0', opacity: 0 };
};
const buttonVariants = pva({
  variants: {
    variant: {
      solid: { bg: 'cl-brand', color: 'white' },
      outline: { bg: 'transparent', color: 'cl-brand' },
    },
    size: { sm: { padding: '4px' }, lg: { padding: '12px' } },
  },
  defaultVariants: { variant: 'solid', size: 'sm' },
  compoundVariants: [
    {
      variant: 'outline',
      size: 'lg',
      styles: { border: '2px solid cl-brand' },
    },
  ],
});
const selection = ref<VariantProps<typeof buttonVariants>>();
const dimension = ref('width');
const resetStyles: VBoxStyles = { color: null, opacity: 'initial' };
</script>
<template>
  <section>
    <button data-testid="grouped" type="button" translate="no" :vb="styles">
      Grouped styles
    </button>
    <button
      data-testid="clean-disabled"
      disabled
      :vb="{ disabled: { color: 'red' } }"
    >
      Clean condition
    </button>
    <button
      data-testid="legacy-disabled"
      disabled
      :vb="{ _disabled: { color: 'red' } }"
    >
      Compatibility condition
    </button>
    <button @click="replace">Replace grouped</button>
    <button @click="styles = null">Clear grouped</button>
    <button @click="styles = undefined">Unset grouped</button>
    <button @click="styles = resetStyles">Reset grouped</button>
    <button data-testid="grouped-pva" v-bind:vb="buttonVariants(selection)">
      Variant styles
    </button>
    <button @click="selection = { variant: 'outline', size: 'lg' }">
      Change variants
    </button>
    <p data-testid="dynamic-style-key" :vb="{ [dimension]: '44px' }">
      Dynamic key
    </p>
    <button @click="dimension = 'height'">Change property</button>
    <p
      data-testid="ordinary-style-object"
      v-bind="{ color: 'red', width: '99px', 'vb-height': '33px' }"
    >
      Semantic spread
    </p>
  </section>
</template>
