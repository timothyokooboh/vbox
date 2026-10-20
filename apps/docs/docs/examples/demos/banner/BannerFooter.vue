<template>
  <div data-scope="banner-footer">
    <button
      vb-w="fit-content"
      vb-border="1px solid cl-gray-600"
      vb-color="cl-gray-700"
      vb-py="0.3rem"
      vb-px="0.9rem"
      vb-fs="fs-sm"
      vb-radius="br-md"
      vb-transition="background-color 0.2s ease-in-out, scale 0.2s ease-in-out"
      :vb-hover="{
        bg: 'cl-gray-50',
      }"
      :vb-dark="{
        '&:hover': {
          backgroundColor: 'cl-rose-200',
        },
      }"
      :vb-active="{
        scale: 0.98,
      }"
      :vb="outlineStyles"
    >
      Upgrade Plan
    </button>
  </div>
</template>

<script setup lang="ts">
import { outlineStyles } from '../style-utils';
</script>
