<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
export default defineComponent({
  data: () => ({ optionsLabel: 'Options preserved' }),
  setup() {
    const color = ref('red');
    const mounted = ref(false);
    onMounted(() => {
      mounted.value = true;
    });
    return {
      color,
      mounted,
      change: () => {
        color.value = 'blue';
      },
    };
  },
});
</script>
<template>
  <button
    data-testid="normal-setup"
    :data-mounted="mounted"
    :vb-color="color"
    @click="change"
  >
    {{ optionsLabel }}
  </button>
</template>
