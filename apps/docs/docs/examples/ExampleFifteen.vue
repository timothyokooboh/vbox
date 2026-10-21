<template>
  <div
    vb-fs="1rem"
    vb-bg="tomato"
    vb-py="2rem"
    vb-text-align="center"
    vb-color="white"
    :vb-mq="{
      '@media (min-width: 48rem)': {
        fontSize: '2rem',
        backgroundColor: 'indigo',
      },
    }"
  >
    Responsive font size
  </div>
</template>
