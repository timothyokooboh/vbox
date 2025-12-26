<template>
  <v-box
    fs="1rem"
    bg="tomato"
    py="2rem"
    text-align="center"
    color="white"
    :mq="{
      '@media (min-width: 48rem)': {
        fontSize: '2rem',
        backgroundColor: 'indigo',
      },
    }"
    >Responsive font size</v-box
  >
</template>
