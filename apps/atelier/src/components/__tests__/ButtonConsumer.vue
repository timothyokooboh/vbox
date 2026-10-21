<script setup lang="ts">
import { ref } from 'vue';
import AppButton from '../AppButton.vue';
defineProps<{ disabled?: boolean }>();
const count = ref(0);
</script>
<template>
  <AppButton
    type="submit"
    translate="no"
    :disabled="disabled"
    vb-color="rgb(128, 0, 128)"
    @click="count++"
    >Save selection</AppButton
  >
  <p role="status">Saved {{ count }}</p>
</template>
