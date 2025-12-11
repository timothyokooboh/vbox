<template>
  <!-- prefixing the token with ff -->
  <v-box is="p" font-family="ff-sans">A little brown fox</v-box>

  <!-- or via CSS custom properties -->
  <v-box is="p" font-family="var(--font-family-mono)">
    A little brown fox
  </v-box>
</template>
