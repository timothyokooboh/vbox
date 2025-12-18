<template>
  <v-box
    bg="cl-bg-product"
    border-radius="br-lg"
    p="1rem"
    box-shadow="0 1px 10px rgba(0,0,0,.1)"
    w="100%"
    max-w="25rem"
    ff="ff-sans"
  >
    <ProductMedia />

    <v-box
      position="relative"
      z="10"
      mt="-1.5rem"
      display="flex"
      flex-direction="column"
      gap="1rem"
      border-top-right-radius="1.5rem"
      border-top-left-radius="1.5rem"
      px="0.6rem"
      pt="2rem"
      pb="1.5rem"
      shadow="0 -10px 40px -15px rgba(0,0,0,0.3)"
      bg="#fff"
      :dark="{
        bg: '#23220F',
      }"
      :md="{
        px: '1.5rem',
      }"
    >
      <ProductHeader />
      <ProductSizeSelector />
      <ProductDescription />
      <v-box mt="auto" display="flex" align-items="center" gap="1rem">
        <ProductQtySelector />
        <AddToCartBtn />
      </v-box>
    </v-box>
  </v-box>
</template>

<script setup lang="ts">
import ProductMedia from './ProductMedia.vue';
import ProductHeader from './ProductHeader.vue';
import ProductSizeSelector from './ProductSizeSelector.vue';
import ProductDescription from './ProductDescription.vue';
import ProductQtySelector from './ProductQtySelector.vue';
import AddToCartBtn from './AddToCartBtn.vue';
</script>
