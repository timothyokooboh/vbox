<template>
  <button
    color="white"
    background-color="indigo"
    padding="0.5rem 1rem"
    :focus="{
      outline: '2px solid tomato',
      outlineOffset: '4px',
    }"
  >
    Keep pressing tab until I receive focus
  </button>
</template>
