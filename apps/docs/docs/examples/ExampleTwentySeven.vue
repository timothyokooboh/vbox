<template>
  <!-- on hover, change the color of the next sibling -->
  <span
    :hover="{
      '& + [data-scope=sibling]': {
        color: 'tomato',
      },
    }"
  >
    Hover on me
  </span>

  <p data-scope="sibling">Next sibling</p>
</template>
