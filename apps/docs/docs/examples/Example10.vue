<template>
  <v-box
    :focus-within="{
      outline: '2px solid tomato',
      outlineOffset: '4px',
    }"
  >
    <p>Focus on the input</p>

    <v-box is="input" border="1px solid indigo" />
  </v-box>
</template>
