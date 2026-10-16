<template>
  <div>
    <div
      vb-display="flex"
      vb-h="3.5rem"
      vb-flex-shrink="0"
      vb-align-items="center"
      vb-radius="br-full"
      vb-bg="cl-gray-100"
      vb-border="1px solid transparent"
      vb-px="0.25rem"
      :vb-dark="{
        bg: '#2f2e1a',
        borderColor: 'rgba(255,255,255,0.05)',
      }"
    >
      <!-- remove -->
      <button
        :vb="qtySelectorStyles"
        @click="updateQty('remove')"
        :disabled="qty <= 1"
      >
        <span vb-fs="1.25rem" class="material-symbols-outlined"> remove </span>
      </button>

      <span
        vb-w="1.5rem"
        vb-text-align="center"
        vb-fs="fs-base"
        vb-fw="fw-bold"
        vb-color="cl-text-product"
      >
        {{ qty }}
      </span>

      <!-- add -->
      <button
        :vb="qtySelectorStyles"
        @click="updateQty('add')"
        :disabled="qty >= 5"
      >
        <span vb-fs="1.25rem" class="material-symbols-outlined"> add </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VBoxStyleProps } from '@veebox/core';
import { ref } from 'vue';

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
