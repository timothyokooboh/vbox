<script setup lang="ts">
import { ref } from 'vue';
import type { VBoxStyles } from '@veebox/core';
const props = defineProps<{
  color?: string;
  size?: string;
  width?: number;
  defaults?: VBoxStyles;
  conditional?: boolean;
}>();
const pressed = defineModel<boolean>({ default: false });
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const element = ref<HTMLButtonElement>();
defineExpose({ focus: () => element.value?.focus() });
</script>
<template>
  <button
    ref="element"
    class="button-internal"
    :style="[{ fontWeight: '500' }]"
    type="button"
    :aria-pressed="pressed"
    @click="
      pressed = !pressed;
      emit('click', $event);
    "
    :data-semantic-color="props.color"
    :data-semantic-size="props.size"
    :data-semantic-width="props.width"
    :vb="[{ padding: '8px' }, props.defaults]"
    vb-color="white"
    vb-bg="black"
    :vb-hover="{ color: 'red', bg: 'purple' }"
    :vb-dark="
      props.conditional
        ? { color: 'blue', md: { hover: { color: 'orange' } } }
        : undefined
    "
    :vb-md="props.conditional ? { color: 'green' } : undefined"
  >
    <slot />
  </button>
</template>
