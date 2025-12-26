<template>
  <v-box
    is="button"
    color="white"
    background-color="indigo"
    padding="0.5rem 1rem"
    :focus-visible="{
      outline: '2px solid tomato',
      outlineOffset: '4px',
    }"
  >
    Keep pressing tab until i receive focus
  </v-box>
</template>
