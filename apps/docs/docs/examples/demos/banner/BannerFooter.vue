<template>
  <div data-scope="banner-footer">
    <v-box
      is="button"
      w="fit-content"
      border="1px solid cl-gray-600"
      color="cl-gray-700"
      py="0.3rem"
      px="0.9rem"
      fs="fs-sm"
      radius="br-md"
      transition="background-color 0.2s ease-in-out, scale 0.2s ease-in-out"
      :hover="{
        bg: 'cl-gray-50',
      }"
      :dark="{
        '&:hover': {
          backgroundColor: 'cl-rose-200',
        },
      }"
      :active="{
        scale: 0.98,
      }"
      v-bind="outlineStyles"
    >
      Upgrade Plan
    </v-box>
  </div>
</template>

<script setup lang="ts">
import { outlineStyles } from '../style-utils';
</script>
