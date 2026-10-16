<template>
  <div
    data-scope="carousel-indicators"
    vb-position="absolute"
    vb-left="0"
    vb-right="0"
    vb-bottom="2.5rem"
    vb-display="flex"
    vb-justify-content="center"
    vb-gap="sp-2"
  >
    <div vb-h="0.25rem" vb-w="1.5rem" vb-radius="br-full" vb-bg="cl-primary" />
    <div
      v-for="n in 3"
      :key="n"
      vb-h="0.25rem"
      vb-w="0.25rem"
      vb-radius="br-full"
      vb-bg="rgba(255,255,255,0.4)"
    />
  </div>
</template>
