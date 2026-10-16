<script setup lang="ts">
import { ref } from 'vue';
import FragmentTarget from './FragmentTarget.vue';
import ControlledTarget from './ControlledTarget.vue';
import UnforwardedTarget from './UnforwardedTarget.vue';
const clicks = ref(0);
</script>
<template>
  <section aria-label="Explicit style targets">
    <FragmentTarget
      data-testid="fragment-target"
      vb-color="yellow"
      @click="clicks++"
    />
    <ControlledTarget data-testid="controlled-target" vb-color="blue" />
    <UnforwardedTarget vb-color="yellow" />
    <output data-testid="forwarded-events">{{ clicks }}</output>
  </section>
</template>
