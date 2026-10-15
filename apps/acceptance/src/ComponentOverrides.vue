<script setup lang="ts">
import { ref } from 'vue';
import StyledButton from './StyledButton.vue';
const override = ref<string | null | undefined>('yellow');
const overrideHover = ref(false);
const pressed = ref(false);
const clicks = ref(0);
const button = ref<InstanceType<typeof StyledButton>>();
const darkOverride = ref(false);
const unrelated = ref(false);
</script>
<template>
  <section aria-label="Single root overrides">
    <button @click="override = override ? undefined : 'yellow'">
      Toggle caller base
    </button>
    <button @click="overrideHover = !overrideHover">Toggle caller hover</button>
    <button @click="override = null">Withdraw caller with null</button>
    <button @click="button?.focus()">Focus component ref</button>
    <button @click="darkOverride = !darkOverride">Toggle caller dark</button>
    <button @click="unrelated = !unrelated">
      Toggle unrelated styled component
    </button>
    <output data-testid="owner-events">{{ clicks }} / {{ pressed }}</output>
    <StyledButton
      ref="button"
      v-model="pressed"
      @click="clicks++"
      :style="[{ fontStyle: 'italic' }, { '--caller-inline': 'yes' }]"
      data-testid="owner-button"
      :class="['button-caller', { 'caller-active': true }]"
      color="semantic-green"
      size="large"
      :width="123"
      :vb="[{ color: override }, overrideHover && { hover: { color: 'blue' } }]"
      ><span>Caller styling</span></StyledButton
    >
    <StyledButton data-testid="owner-left" vb-padding-left="20px"
      >Caller longhand</StyledButton
    >
    <StyledButton
      data-testid="owner-padding"
      :defaults="{ paddingLeft: '20px' }"
      vb-padding="12px"
      >Caller shorthand</StyledButton
    >
    <StyledButton
      data-testid="owner-conditionals"
      conditional
      vb-color="yellow"
      :vb-dark="darkOverride ? { color: 'purple' } : null"
      >Conditional defaults</StyledButton
    >
    <StyledButton
      v-if="unrelated"
      data-testid="owner-unrelated"
      vb-color="yellow"
      >Unrelated registration</StyledButton
    >
  </section>
</template>
