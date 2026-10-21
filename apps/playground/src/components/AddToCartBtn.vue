<template>
  <div>
    <button
      vb-cursor="pointer"
      vb-border="none"
      vb-bg="cl-primary"
      vb-position="relative"
      vb-display="flex"
      vb-align-items="center"
      vb-justify-content="center"
      vb-gap="0.5rem"
      vb-overflow="hidden"
      vb-radius="br-full"
      vb-h="3.5rem"
      vb-flex-grow="1"
      vb-px="1.5rem"
      vb-shadow="0 8px 20px -6px rgba(249,245,6,0.5)"
      vb-transition="scale 0.2s ease-in-out"
      :vb-hover="{
        '[data-scope=empty-div]': {
          opacity: 1,
        },
        '[data-scope=icon]': {
          transform: 'translateX(-0.25rem)',
        },
      }"
      :vb-active="{
        scale: 0.95,
      }"
    >
      <span
        vb-position="relative"
        z="10"
        vb-display="flex"
        vb-align-items="center"
        vb-gap="0.5rem"
      >
        <span
          data-scope="icon"
          vb-color="#1c1c0d"
          class="material-symbols-outlined"
          vb-transition="transform 0.2s ease-in-out"
        >
          shopping_cart
        </span>
        <span vb-fs="fs-base" vb-fw="fw-bold" vb-color="#1c1c0d">
          Add to cart
        </span>
      </span>

      <div
        data-scope="empty-div"
        vb-position="absolute"
        vb-top="0"
        vb-bottom="0"
        vb-right="0"
        vb-left="0"
        vb-bg="rgba(255,255,255,0.2)"
        vb-opacity="0"
        vb-transition="opacity 0.2s ease-in-out"
      />
    </button>
  </div>
</template>

<script setup lang="ts"></script>
