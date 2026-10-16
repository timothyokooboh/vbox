<script setup lang="ts">
import { ref } from 'vue';
import { Toggle } from 'radix-vue';
import { RouterLink, useRoute } from 'vue-router';
import { VBox } from '@veebox/vue';
import FrameworkLink from './FrameworkLink.vue';
const pressed = ref(false);
const route = useRoute();
</script>
<template>
  <section aria-label="Framework and primitive targets">
    <RouterLink to="/destination" vb-color="purple"
      >Router destination</RouterLink
    >
    <FrameworkLink to="/framework" vb-color="green"
      >Framework link</FrameworkLink
    >
    <output data-testid="integration-route">{{ route.path }}</output>
    <Toggle as-child v-model:pressed="pressed" vb-color="yellow">
      <button vb-font-weight="700">Accessible toggle</button>
    </Toggle>
    <output data-testid="integration-toggle">{{ pressed }}</output>
    <VBox as-child color="white" vb-color="blue">
      <Toggle>Adopted primitive</Toggle>
    </VBox>
  </section>
</template>
