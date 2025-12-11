<template>
  <!-- on hover, change the color of the next sibling -->
  <v-box
    is="span"
    :hover="{
      '& + [data-scope=sibling]': {
        color: 'tomato',
      },
    }"
  >
    Hover on me
  </v-box>

  <p data-scope="sibling">Next sibling</p>
</template>
