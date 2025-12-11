<template>
  <v-box
    :declarations="{
      color: 'tomato',
      '&:has(p)': {
        bg: 'indigo',
      },
    }"
  >
    <p>Just for convenience</p>
  </v-box>
</template>
