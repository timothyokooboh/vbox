<script setup lang="ts">
import { ref } from 'vue';
import ForwardedAction from './ForwardedAction.vue';
const override = ref(true);
const saved = ref(0);
</script>
<template>
  <section
    aria-label="Class forwarding example"
    vb-display="grid"
    vb-gap="12px"
    vb-p="16px"
    vb-border="1px solid currentColor"
  >
    <ForwardedAction
      color="primary"
      size="large"
      :vb-color="override ? 'yellow' : null"
      @click="saved++"
      >Save draft</ForwardedAction
    >
    <p role="status">Saved {{ saved }}</p>
    <button type="button" @click="override = !override">
      {{ override ? 'Withdraw caller color' : 'Restore caller color' }}
    </button>
  </section>
</template>
