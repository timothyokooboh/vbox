<template>
  <div
    vb-w="250px"
    vb-bg="tomato"
    vb-p="1rem"
    vb-color="white"
    vb-position="relative"
    vb-transition="transform 0.2s ease-in-out, background-color 0.2s ease-in-out"
    :vb-hover="{
      transform: 'translateY(-2px)',
      backgroundColor: 'indigo',
    }"
  >
    Hover on this box
  </div>
</template>
