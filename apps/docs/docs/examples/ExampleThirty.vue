<template>
  <div
    :declarations="{
      '--border-input': 'blue',
    }"
  >
    <v-box is="input" border="1px solid var(--border-input)" />
  </div>
</template>
