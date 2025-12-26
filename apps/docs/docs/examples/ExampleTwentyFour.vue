<template>
  <!-- prefixing the token with ls -->
  <v-box is="p" letter-spacing="ls-tighter">A little brown fox</v-box>

  <!-- or via CSS custom properties -->
  <v-box is="p" letter-spacing="var(--letter-spacing-wider)">
    A little brown fox
  </v-box>
</template>
