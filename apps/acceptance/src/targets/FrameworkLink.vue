<script setup lang="ts">
import { RouterLink } from 'vue-router';
defineOptions({ inheritAttrs: false });
defineProps<{ to: string }>();
</script>
<template>
  <RouterLink vb-color="white" :to="to" v-bind="$attrs"><slot /></RouterLink>
</template>
