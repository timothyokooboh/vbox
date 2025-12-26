<template>
  <v-box
    is="label"
    position="relative"
    :pseudos="{
      '::after': {
        position: 'absolute',
        content: '*',
        color: 'tomato',
        top: 0,
        right: '-12px',
        fontSize: '1.5rem',
      },
    }"
  >
    Enter your username
  </v-box>
</template>
