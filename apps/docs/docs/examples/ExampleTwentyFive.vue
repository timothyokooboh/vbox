<template>
  <!-- prefixing the token with sp -->
  <v-box
    w="250px"
    bg="tomato"
    color="#fff"
    text-align="center"
    padding="sp-2"
    mb="sp-3"
  >
    A box
  </v-box>

  <!-- or via CSS custom properties -->
  <v-box
    w="250px"
    bg="tomato"
    color="#fff"
    text-align="center"
    padding="var(--spacing-6)"
  >
    A box
  </v-box>
</template>
