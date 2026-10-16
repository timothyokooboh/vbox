<script lang="ts">
import { defineComponent } from 'vue';
const OptionsFixture = defineComponent({
  data: () => ({ color: 'red' }),
  methods: {
    updateColor() {
      this.color = 'blue';
    },
  },
});
export default OptionsFixture;
</script>
<template>
  <button :vb-color="color" @click="updateColor">Options API style</button>
</template>
