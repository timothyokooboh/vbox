<template>
  <v-box is="section" data-scope="product-description" flex-grow="1">
    <v-box
      is="h2"
      my="0"
      mb="0.5rem"
      fs="fs-sm"
      fw="fw-bold"
      color="cl-text-product"
      class="vp-raw"
    >
      Description
    </v-box>
    <v-box
      is="p"
      my="0"
      fs="fs-sm"
      lh="lh-relaxed"
      color="cl-gray-600"
      :dark="{
        color: 'cl-gray-300',
      }"
    >
      High-performance running shoes designed for the urban environment.
      Features breathable mesh and superior cushioning for maximum comfort
      during your daily run.
    </v-box>
  </v-box>
</template>
