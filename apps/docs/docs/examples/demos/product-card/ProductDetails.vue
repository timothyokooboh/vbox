<template>
  <v-box
    position="relative"
    z="10"
    mt="-1.5rem"
    display="flex"
    flex-direction="column"
    gap="1rem"
    border-top-right-radius="1.5rem"
    border-top-left-radius="1.5rem"
    px="0.6rem"
    pt="2rem"
    pb="1.5rem"
    shadow="0 -10px 40px -15px rgba(0,0,0,0.3)"
    bg="#fff"
    :dark="{
      bg: '#23220F',
    }"
    :md="{
      px: '1.5rem',
    }"
  >
    <slot />
  </v-box>
</template>
