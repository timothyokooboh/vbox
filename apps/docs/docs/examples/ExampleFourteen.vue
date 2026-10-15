<template>
  <div
    display="grid"
    gap="1rem"
    :sm="{
      gridTemplateColumns: 'repeat(2, 1fr)',
    }"
    :md="{
      gridTemplateColumns: 'repeat(3, 1fr)',
    }"
    :lg="{
      gridTemplateColumns: 'repeat(4, 1fr)',
    }"
  >
    <div
      v-for="n in 8"
      :key="n"
      w="100%"
      h="150px"
      bg="tomato"
      :sm="{ width: '150px' }"
    />
  </div>
</template>
