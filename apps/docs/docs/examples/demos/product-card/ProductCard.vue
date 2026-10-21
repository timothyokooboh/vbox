<template>
  <div
    data-scope="product-card"
    vb-bg="cl-bg-product"
    vb-border-radius="br-lg"
    vb-p="1rem"
    vb-box-shadow="0 1px 10px rgba(0,0,0,.1)"
    vb-w="100%"
    vb-max-w="25rem"
    vb-ff="ff-sans"
  >
    <ProductMedia />
    <ProductDetails>
      <ProductHeader />
      <ProductSizeSelector />
      <ProductDescription />
      <div vb-mt="auto" vb-display="flex" vb-align-items="center" vb-gap="1rem">
        <ProductQtySelector />
        <AddToCartBtn />
      </div>
    </ProductDetails>
  </div>
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
