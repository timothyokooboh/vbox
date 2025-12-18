<template>
  <v-box
    display="flex"
    h="3.5rem"
    flex-shrink="0"
    align-items="center"
    radius="br-full"
    bg="cl-gray-100"
    border="1px solid transparent"
    px="0.25rem"
    :dark="{
      bg: '#2f2e1a',
      borderColor: 'rgba(255,255,255,0.05)',
    }"
  >
    <!-- remove -->
    <v-box
      is="button"
      v-bind="qtySelectorStyles"
      @click="updateQty('remove')"
      :disabled="qty <= 1"
    >
      <v-box is="span" fs="1.25rem" class="material-symbols-outlined">
        remove
      </v-box>
    </v-box>

    <v-box
      is="span"
      w="1.5rem"
      text-align="center"
      fs="fs-base"
      fw="fw-bold"
      color="cl-text-product"
    >
      {{ qty }}
    </v-box>

    <!-- add -->
    <v-box
      is="button"
      v-bind="qtySelectorStyles"
      @click="updateQty('add')"
      :disabled="qty >= 5"
    >
      <v-box is="span" fs="1.25rem" class="material-symbols-outlined">
        add
      </v-box>
    </v-box>
  </v-box>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { VBoxStyleProps } from '@veebox/core';

const qtySelectorStyles: VBoxStyleProps = {
  cursor: 'pointer',
  border: 'none',
  backgroundColor: 'transparent',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  h: '3rem',
  w: '3rem',
  radius: 'br-full',
  color: 'cl-text-product',
  transition: 'background-color 0.2s ease-in-out, scale 0.2s ease-in-out',
  hover: {
    bg: 'rgba(0,0,0,0.05)',
  },
  active: {
    scale: 0.9,
  },
  dark: {
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.1)',
    },
  },
  _disabled: {
    cursor: 'no-drop',
    opacity: 0.5,
  },
};

const qty = ref(1);

const updateQty = (type: 'add' | 'remove') => {
  const delta = type === 'add' ? 1 : -1;
  qty.value = Math.min(5, Math.max(1, qty.value + delta));
};
</script>
