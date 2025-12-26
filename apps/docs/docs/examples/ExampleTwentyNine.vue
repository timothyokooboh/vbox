<template>
  <v-box
    :declarations="{
      color: 'tomato',
      padding: '0.5rem',
      '&:has(p)': {
        background: 'indigo',
      },
    }"
  >
    <p>Just for convenience</p>
  </v-box>
</template>
