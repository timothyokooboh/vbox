<template>
  <!-- prefixing the token with sp -->
  <div
    vb-w="250px"
    vb-bg="tomato"
    vb-color="#fff"
    vb-text-align="center"
    vb-padding="sp-2"
    vb-mb="sp-3"
  >
    A box
  </div>

  <!-- or via CSS custom properties -->
  <div
    vb-w="250px"
    vb-bg="tomato"
    vb-color="#fff"
    vb-text-align="center"
    vb-padding="var(--spacing-6)"
  >
    A box
  </div>
</template>
