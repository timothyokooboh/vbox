<script setup lang="ts">
import { ref } from 'vue';
import type { VBoxStyles } from '@veebox/core';
const disabled = ref(false);
const override = ref<string | null | undefined>('green');
const order = ref(['red', 'blue']);
const states: VBoxStyles = {
  color: 'black',
  disabled: { color: 'gray' },
  active: { color: 'purple' },
  focusVisible: { color: 'orange' },
  focus: { color: 'blue' },
  focusWithin: { color: 'gold' },
  hover: { color: 'red' },
};
</script>
<template>
  <section aria-label="Interaction styling demo">
    <button data-testid="interaction-start">Start interaction demo</button>
    <button
      data-testid="interaction-priority"
      :disabled="disabled"
      :vb="states"
    >
      Keyboard and pointer target
    </button>
    <button
      data-testid="interaction-combined"
      :vb="[
        { hover: { focus: { color: 'red', opacity: 0.4 } } },
        { focus: { hover: { color: 'blue' } } },
        { active: { color: 'purple' } },
        { focus: { color: 'yellow' } },
      ]"
      :vb-hover="{ focus: { color: override } }"
    >
      Combined states
    </button>
    <div
      data-testid="interaction-within"
      :vb-hover="{ color: 'red' }"
      :vb-focus-within="{ color: 'gold' }"
    >
      <input aria-label="Nested focus input" />
    </div>
    <button
      data-testid="interaction-focus"
      :vb="{
        focus: { color: 'blue' },
        focusWithin: { color: 'gold' },
        hover: { color: 'red' },
      }"
    >
      Focus priority
    </button>
    <button
      class="authored-interaction"
      v-for="color in order"
      :key="color"
      :data-testid="`interaction-cache-${color}`"
      :vb="{ hover: { focus: { color } } }"
    >
      {{ color }} nested cache
    </button>
    <button @click="order = [...order].reverse()">
      Reverse interaction registration
    </button>
    <button
      data-testid="interaction-legacy"
      disabled
      :vb-_disabled="{ color: 'green' }"
    >
      Compatibility template spelling
    </button>
    <button @click="override = null">Withdraw state override</button>
    <button @click="override = undefined">Unset state override</button>
    <button @click="disabled = !disabled">Toggle interaction disabled</button>
  </section>
</template>
