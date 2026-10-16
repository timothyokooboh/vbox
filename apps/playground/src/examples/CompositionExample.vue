<script setup lang="ts">
import { ref } from 'vue';
import type { VBoxStyles } from '@veebox/core';

const direct = ref(true);
const later = ref(true);
const defaults = {
  color: 'red',
  padding: '12px',
} as const satisfies VBoxStyles;
const override = { color: 'blue' } as const satisfies VBoxStyles;
</script>

<template>
  <section aria-labelledby="composition-heading">
    <h2 id="composition-heading">Sources and withdrawal</h2>
    <p>
      Later grouped sources win in matching contexts. Direct bindings win over
      the group, even when written first. Null removes a contribution, not the
      defaults.
    </p>
    <div
      data-testid="playground-composition"
      :vb-color="direct ? 'purple' : null"
      :vb-padding-left="direct ? '24px' : null"
      :vb="[defaults, later && override]"
      vb-border="1px solid currentColor"
    >
      Direct purple / grouped blue / default red. Default padding 12px; direct
      left padding 24px.
    </div>
    <button type="button" @click="direct = false">
      Withdraw direct styles
    </button>
    <button type="button" @click="later = false">Withdraw later source</button>
    <button type="button" @click="direct = later = true">
      Restore composition
    </button>
    <p
      data-testid="playground-shorthand"
      :vb="[{ paddingLeft: '32px' }, { padding: '8px' }]"
    >
      The later shorthand intentionally replaces all four sides.
    </p>
  </section>
</template>
