<template>
  <label
    vb-position="relative"
    :vb-pseudos="{
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
  </label>
</template>
