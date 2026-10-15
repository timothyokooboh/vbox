<template>
  <div
    :focus-within="{
      outline: '2px solid tomato',
      outlineOffset: '4px',
    }"
  >
    <p>Focus on the input</p>

    <input border="1px solid indigo" />
  </div>
</template>
