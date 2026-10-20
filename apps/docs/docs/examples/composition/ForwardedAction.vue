<script setup lang="ts">
import { useId } from 'vue';
import VariantButton from './VariantButton.vue';
defineOptions({ inheritAttrs: false });
const helpId = useId();
</script>
<template>
  <span :id="helpId">Saves the current draft.</span>
  <VariantButton v-bind="$attrs" :aria-describedby="helpId"
    ><slot
  /></VariantButton>
</template>
