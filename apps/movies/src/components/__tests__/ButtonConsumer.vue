<script setup lang="ts">
import { ref } from 'vue';
import type { VBoxStyles } from '@veebox/core';
import AppButton from '../AppButton.vue';
defineProps<{ override: boolean; disabled?: boolean }>();
const saved = ref(0);
const caller = { color: 'yellow' } as const satisfies VBoxStyles;
</script>
<template>
  <AppButton
    type="submit"
    variant="solid"
    :disabled="disabled"
    :vb="[override && caller]"
    translate="no"
    @click="saved++"
    >Save draft</AppButton
  >
  <p role="status">Saved {{ saved }}</p>
</template>
