<script setup lang="ts">
import { ref } from 'vue';
import OwnedLayer from './OwnedLayer.vue';
import OwnerSlotHost from './OwnerSlotHost.vue';
import { sharedStyles } from './styles';
const active = ref(true);
const revision = ref(0);
</script>
<template>
  <section aria-label="Cached style ownership">
    <button @click="active = false">Withdraw live shared styling</button>
    <button @click="active = true">Restore live shared styling</button>
    <button @click="revision++">Invalidate memo styling</button>
    <OwnedLayer data-testid="cached-live" :vb="active ? sharedStyles : null"
      >Live</OwnedLayer
    >
    <OwnedLayer
      v-once
      data-testid="cached-once"
      :vb="active ? sharedStyles : null"
      >Once</OwnedLayer
    >
    <OwnedLayer
      v-memo="[revision]"
      data-testid="cached-memo"
      :vb="active ? sharedStyles : null"
      >Memo</OwnedLayer
    >
    <OwnerSlotHost v-slot="{ label }">
      <OwnedLayer
        data-testid="cached-slot"
        :nearer="{ color: 'green' }"
        :vb="active ? sharedStyles : null"
        >{{ label }}</OwnedLayer
      >
    </OwnerSlotHost>
  </section>
</template>
