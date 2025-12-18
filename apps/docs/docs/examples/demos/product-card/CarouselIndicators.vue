<template>
  <v-box
    position="absolute"
    left="0"
    right="0"
    bottom="2.5rem"
    display="flex"
    justify-content="center"
    gap="sp-2"
  >
    <v-box h="0.25rem" w="1.5rem" radius="br-full" bg="cl-primary" />
    <v-box
      v-for="n in 3"
      :key="n"
      h="0.25rem"
      w="0.25rem"
      radius="br-full"
      bg="rgba(255,255,255,0.4)"
    />
  </v-box>
</template>
