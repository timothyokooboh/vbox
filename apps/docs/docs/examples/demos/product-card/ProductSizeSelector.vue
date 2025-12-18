<template>
  <v-box is="section">
    <v-box
      display="flex"
      align-items="center"
      justify-content="space-between"
      mb="0.7rem"
    >
      <v-box
        is="h2"
        my="0"
        fs="fs-sm"
        fw="fw-bold"
        color="cl-text-product"
        class="vp-raw"
      >
        Select Size
      </v-box>
      <v-box
        is="button"
        cursor="pointer"
        bg="transparent"
        fs="fs-xs"
        fw="fw-medium"
        color="cl-gray-500"
        text-decoration="underline"
        border="none"
        :dark="{
          color: 'cl-gray-400',
        }"
        >Size Guide</v-box
      >
    </v-box>

    <v-box
      display="flex"
      gap="sp-3"
      overflow-x="auto"
      scrollbar-width="none"
      :declarations="{
        '-ms-overflow-style': 'none',
        '&::-webkit-scrollbar': {
          display: 'none',
        },
      }"
    >
      <v-box is="button" v-bind="baseSizeSelectionStyles">39</v-box>
      <v-box is="button" v-bind="baseSizeSelectionStyles">40</v-box>
      <v-box
        is="button"
        v-bind="baseSizeSelectionStyles"
        bg="cl-primary"
        border="none"
        shadow="0 4px 12px rgba(249,245,6,0.3)"
        :dark="{
          color: '#1c1c0d',
        }"
        >41</v-box
      >
      <v-box is="button" v-bind="baseSizeSelectionStyles">42</v-box>
      <v-box is="button" v-bind="baseSizeSelectionStyles">43</v-box>
      <v-box is="button" v-bind="baseSizeSelectionStyles">44</v-box>
      <v-box is="button" v-bind="baseSizeSelectionStyles">45</v-box>
    </v-box>
  </v-box>
</template>

<script setup lang="ts">
import type { VBoxStyleProps } from '@veebox/core';

const baseSizeSelectionStyles: VBoxStyleProps = {
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  h: '3rem',
  w: '3rem',
  radius: 'br-full',
  border: '1px solid cl-gray-200',
  bg: 'transparent',
  color: 'cl-text-product',
  fs: 'fs-sm',
  fw: 'fw-medium',
  transition: 'border-color 0.2s ease-in-out, scale 0.2s ease-in-out',
  hover: {
    borderColor: 'cl-primary',
  },
  active: {
    scale: 0.9,
  },
  dark: {
    borderColor: 'cl-gray-700',
    '&:hover': {
      borderColor: 'cl-primary',
    },
  },
};
</script>
