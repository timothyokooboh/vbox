<template>
  <section data-scope="product-size-selector">
    <div
      vb-display="flex"
      vb-align-items="center"
      vb-justify-content="space-between"
      vb-mb="0.7rem"
    >
      <h2
        vb-my="0"
        vb-fs="fs-sm"
        vb-fw="fw-bold"
        vb-color="cl-text-product"
        class="vp-raw"
      >
        Select Size
      </h2>
      <button
        vb-cursor="pointer"
        vb-bg="transparent"
        vb-fs="fs-xs"
        vb-fw="fw-medium"
        vb-color="cl-gray-500"
        vb-text-decoration="underline"
        vb-border="none"
        :vb-dark="{
          color: 'cl-gray-400',
        }"
        :vb="outlineStyles"
      >
        Size Guide
      </button>
    </div>

    <div
      vb-display="flex"
      vb-gap="sp-3"
      vb-py="sp-1"
      vb-overflow-x="auto"
      vb-scrollbar-width="none"
      :vb-declarations="{
        '-ms-overflow-style': 'none',
        '&::-webkit-scrollbar': {
          display: 'none',
        },
      }"
    >
      <button :vb="baseSizeSelectionStyles">39</button>
      <button :vb="baseSizeSelectionStyles">40</button>
      <button
        :vb="baseSizeSelectionStyles"
        vb-bg="cl-primary"
        vb-border="none"
        vb-shadow="0 4px 12px rgba(249,245,6,0.3)"
        :vb-dark="{
          color: '#1c1c0d',
        }"
      >
        41
      </button>
      <button :vb="baseSizeSelectionStyles">42</button>
      <button :vb="baseSizeSelectionStyles">43</button>
      <button :vb="baseSizeSelectionStyles">44</button>
      <button :vb="baseSizeSelectionStyles">45</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { VBoxStyleProps } from '@veebox/core';
import { outlineStyles } from '../style-utils';

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
  ...outlineStyles,
};
</script>
