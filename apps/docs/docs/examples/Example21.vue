<template>
  <!-- prefixing the token with fw -->
  <v-box is="p" font-weight="fw-thin">A little brown fox</v-box>

  <!-- or via CSS custom properties -->
  <v-box is="p" font-weight="var(--font-weight-black)">
    A little brown fox
  </v-box>
</template>
