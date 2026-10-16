<script setup lang="ts">
import { ref } from 'vue';
import type { VBoxStyles } from '@veebox/core';

const clicks = ref(0);
const override = ref(true);
const semantic = { translate: 'no' as const, type: 'button' as const };
const movement: VBoxStyles = { translate: '8px' };
const callerStyles = {
  color: 'yellow',
  paddingLeft: '24px',
} as const satisfies VBoxStyles;
</script>

<template>
  <section aria-labelledby="nuxt-boundary-heading" vb-margin-top="24px">
    <h2 id="nuxt-boundary-heading">Semantic bindings and explicit targets</h2>
    <p>
      These styles are in the initial server HTML, not just applied after
      mounting. Ordinary v-bind remains semantic; :vb supplies styling.
    </p>
    <button
      v-bind="semantic"
      :vb="movement"
      data-testid="nuxt-translate"
      @click="clicks++"
    >
      HTML translate="no", CSS translate="8px"
    </button>
    <div
      vb-display="flex"
      vb-flex-wrap="wrap"
      vb-gap="16px"
      vb-align-items="center"
      vb-margin-top="16px"
    >
      <ForwardedSsrButton
        data-testid="nuxt-forwarded"
        :vb="[override && callerStyles]"
        @click="clicks++"
        >Forwarded SSR target</ForwardedSsrButton
      >
    </div>
    <p>
      Clicks: <output data-testid="nuxt-boundary-clicks">{{ clicks }}</output>
    </p>
    <button type="button" @click="override = false">
      Withdraw forwarded styles
    </button>
  </section>
</template>
