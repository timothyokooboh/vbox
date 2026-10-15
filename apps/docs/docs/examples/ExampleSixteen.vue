<template>
  <div
    container-name="responsive-box"
    container-type="inline-size"
    border="2px dashed gray"
    padding="1rem"
  >
    <div
      w="100%"
      max-w="400px"
      border="1px solid black"
      p="1rem"
      bg="tomato"
      color="white"
      :cq="{
        '@container responsive-box (min-width: 40rem)': {
          backgroundColor: 'indigo',
        },
      }"
    >
      Resize to see background color change.
    </div>
  </div>
</template>
