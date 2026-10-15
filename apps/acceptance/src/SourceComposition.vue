<script setup lang="ts">
import { shallowRef, ref } from 'vue';
import { pva } from '@veebox/property-variance-authority';
import type { VBoxStyleInput, VBoxStyles } from '@veebox/core';

const base = Object.freeze({ padding: '8px', color: 'red', opacity: 0.6 });
const edge = Object.freeze({ paddingLeft: '20px', color: 'blue' });
const sources = shallowRef<VBoxStyleInput>([base, edge]);
const direct = ref<string | null | undefined>('12px');
const pvaStyles = pva({
  variants: {
    intent: { filled: { hover: { color: 'red', opacity: 0.2 } } },
    size: { wide: { hover: { color: 'blue' } } },
  },
  defaultVariants: { intent: 'filled', size: 'wide' },
});
const absence: VBoxStyles = { padding: null, color: undefined, hover: null };
</script>
<template>
  <section>
    <p data-testid="sources" :vb="sources">Composed</p>
    <p data-testid="sources-direct-first" :vb-padding="direct" :vb="sources">
      Direct first
    </p>
    <p data-testid="sources-direct-last" :vb="sources" :vb-padding="direct">
      Direct last
    </p>
    <p data-testid="sources-independent" :vb="[base, edge]">Shared sources</p>
    <p
      data-testid="sources-fallback"
      :vb="[{ color: 'red' }, { color: 'invalid-css-color' }]"
    >
      CSS fallback
    </p>
    <p
      data-testid="sources-aliases"
      :vb="[{ pl: '30px', p: '4px' }, { 'padding-inline-start': '16px' }]"
    >
      Logical declarations
    </p>
    <p data-testid="sources-pva" :vb="pvaStyles()">PVA as received</p>
    <button
      data-testid="sources-contexts"
      disabled
      :vb="[
        { _disabled: { color: 'red', opacity: 0.4 } },
        { disabled: { color: 'blue' } },
      ]"
    >
      Condition composition
    </button>
    <p
      data-testid="sources-conditional"
      :vb="[{ dark: { color: 'blue' } }, { color: 'red' }]"
    >
      Context preservation
    </p>
    <p data-testid="sources-snapshot">{{ JSON.stringify(base) }}</p>
    <button @click="sources = [edge, base]">Reverse sources</button>
    <button @click="sources = [base, false, null, undefined, absence]">
      Withdraw source
    </button>
    <button @click="sources = [base, { opacity: 0, padding: 'initial' }]">
      Reset source
    </button>
    <button @click="sources = null">Clear sources</button>
    <button @click="sources = [base, edge]">Insert source</button>
    <button @click="direct = null">Withdraw direct</button>
    <button @click="direct = '24px'">Replace direct</button>
  </section>
</template>
