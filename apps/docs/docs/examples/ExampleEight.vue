<template>
  <div
    w="250px"
    bg="tomato"
    p="1rem"
    color="white"
    position="relative"
    transition="transform 0.2s ease-in-out, background-color 0.2s ease-in-out"
    :hover="{
      transform: 'translateY(-2px)',
      backgroundColor: 'indigo',
    }"
  >
    Hover on this box
  </div>
</template>
