<template>
  <v-box
    :declarations="{
      '--border-input': 'blue',
    }"
  >
    <v-box is="input" border="1px solid var(--border-input)" />
  </v-box>
</template>

<script setup lang="ts"></script>

<style scoped></style>
