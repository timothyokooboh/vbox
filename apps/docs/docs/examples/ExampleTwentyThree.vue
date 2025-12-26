<template>
  <!-- prefixing the token with lh -->
  <v-box line-height="lh-tight">
    A little brown fox <br />
    hiding at the park
  </v-box>

  <!-- or via CSS custom properties -->
  <v-box is="p" line-height="var(--line-height-loose)">
    A little brown fox <br />
    hiding at the park
  </v-box>
</template>
