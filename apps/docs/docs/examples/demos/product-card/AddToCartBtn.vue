<template>
  <v-box
    data-scope="add-to-cart-btn"
    is="button"
    cursor="pointer"
    border="none"
    bg="cl-primary"
    position="relative"
    display="flex"
    align-items="center"
    justify-content="center"
    gap="0.5rem"
    overflow="hidden"
    radius="br-full"
    h="3.5rem"
    flex-grow="1"
    px="1.5rem"
    shadow="0 8px 20px -6px rgba(249,245,6,0.5)"
    transition="scale 0.2s ease-in-out"
    v-bind="outlineStyles"
    :hover="{
      '[data-scope=empty-div]': {
        opacity: 1,
      },
      '[data-scope=icon]': {
        transform: 'translateX(-0.25rem)',
      },
    }"
    :active="{
      scale: 0.95,
    }"
  >
    <v-box
      is="span"
      position="relative"
      z="10"
      display="flex"
      align-items="center"
      gap="0.2rem"
      :md="{
        gap: '0.5rem',
      }"
    >
      <v-box
        data-scope="icon"
        is="span"
        color="#1c1c0d"
        class="material-symbols-outlined"
        transition="transform 0.2s ease-in-out"
        display="none !important"
        :md="{
          display: 'inline-block !important',
        }"
      >
        shopping_cart
      </v-box>
      <v-box
        is="span"
        fs="fs-sm"
        fw="fw-bold"
        color="#1c1c0d"
        :md="{
          fs: 'fs-base',
        }"
      >
        Add to cart
      </v-box>
    </v-box>

    <v-box
      data-scope="empty-div"
      position="absolute"
      top="0"
      bottom="0"
      right="0"
      left="0"
      bg="rgba(255,255,255,0.2)"
      opacity="0"
      transition="opacity 0.2s ease-in-out"
    />
  </v-box>
</template>

<script lang="ts" setup>
import { VBox } from '@veebox/vue';
import { outlineStyles } from '../style-utils';
</script>
