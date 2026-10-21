<script setup lang="ts">
import { ref } from 'vue';
import { pva } from '@veebox/property-variance-authority';
const active = ref(false);
const styles = pva({
  variants: { size: { large: { padding: '16px' } } },
  defaultVariants: { size: 'large' },
});
</script>
<template>
  <button
    id="probe"
    translate="no"
    vb-translate="8px"
    vb-paint="cl-brand"
    :vb="styles()"
    :vb-hover="{ color: 'red' }"
    :vb-width="active ? '120px' : '100px'"
    @click="active = !active"
  >
    Packed consumer
  </button>
</template>
