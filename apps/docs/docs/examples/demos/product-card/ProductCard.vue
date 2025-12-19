<template>
  <v-box
    data-scope="product-card"
    bg="cl-bg-product"
    border-radius="br-lg"
    p="1rem"
    box-shadow="0 1px 10px rgba(0,0,0,.1)"
    w="100%"
    max-w="25rem"
    ff="ff-sans"
  >
    <ProductMedia />
    <ProductDetails>
      <ProductHeader />
      <ProductSizeSelector />
      <ProductDescription />
      <v-box mt="auto" display="flex" align-items="center" gap="1rem">
        <ProductQtySelector />
        <AddToCartBtn />
      </v-box>
    </ProductDetails>
  </v-box>
</template>

<script setup lang="ts">
import ProductMedia from './ProductMedia.vue';
import ProductDetails from './ProductDetails.vue';
import ProductHeader from './ProductHeader.vue';
import ProductSizeSelector from './ProductSizeSelector.vue';
import ProductDescription from './ProductDescription.vue';
import ProductQtySelector from './ProductQtySelector.vue';
import AddToCartBtn from './AddToCartBtn.vue';
</script>
