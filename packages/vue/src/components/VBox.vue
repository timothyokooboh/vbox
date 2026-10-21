<script lang="ts" setup>
import type { VBoxProps } from '@veebox/core';
import { computed, useAttrs } from 'vue';
import { useDeriveChildNode } from '../composables/useDeriveChildNode';
import { useLegacyStyleBinding } from '../composables/useLegacyStyleBinding';

const props = defineProps<VBoxProps>();
const attrs = useAttrs();
const bind = useLegacyStyleBinding();
const className = computed(() => bind({ ...props, ...attrs }).class as string);
const childNode = useDeriveChildNode(className);
</script>

<template>
  <component v-if="props.asChild" :is="childNode" />

  <component v-else :is="props.is || 'div'" :class="className">
    <slot />
  </component>
</template>
