<template>
  <div
    vb-container-name="responsive-box"
    vb-container-type="inline-size"
    vb-border="2px dashed gray"
    vb-padding="1rem"
  >
    <div
      vb-w="100%"
      vb-max-w="400px"
      vb-border="1px solid black"
      vb-p="1rem"
      vb-bg="tomato"
      vb-color="white"
      :vb-cq="{
        '@container responsive-box (min-width: 40rem)': {
          backgroundColor: 'indigo',
        },
      }"
    >
      Resize to see background color change.
    </div>
  </div>
</template>
