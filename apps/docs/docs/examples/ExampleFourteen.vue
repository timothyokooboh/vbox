<template>
  <div
    vb-display="grid"
    vb-gap="1rem"
    :vb-sm="{
      gridTemplateColumns: 'repeat(2, 1fr)',
    }"
    :vb-md="{
      gridTemplateColumns: 'repeat(3, 1fr)',
    }"
    :vb-lg="{
      gridTemplateColumns: 'repeat(4, 1fr)',
    }"
  >
    <div
      v-for="n in 8"
      :key="n"
      vb-w="100%"
      vb-h="150px"
      vb-bg="tomato"
      :vb-sm="{ width: '150px' }"
    />
  </div>
</template>
