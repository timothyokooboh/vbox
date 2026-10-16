<template>
  <div>
    <div
      vb-bg="cl-bg-product"
      vb-border-radius="br-lg"
      vb-p="1rem"
      vb-box-shadow="0 1px 10px rgba(0,0,0,.1)"
      vb-w="100%"
      vb-max-w="25rem"
      vb-ff="ff-sans"
    >
      <ProductMedia />

      <div
        vb-position="relative"
        z="10"
        vb-mt="-1.5rem"
        vb-display="flex"
        vb-flex-direction="column"
        vb-gap="1rem"
        vb-border-top-right-radius="1.5rem"
        vb-border-top-left-radius="1.5rem"
        vb-px="1.5rem"
        vb-pt="2rem"
        vb-pb="1.5rem"
        vb-shadow="0 -10px 40px -15px rgba(0,0,0,0.3)"
        vb-bg="#fff"
        :vb-dark="{
          bg: '#23220F',
        }"
      >
        <ProductHeader />
        <ProductSizeSelector />
        <ProductDescription />
        <div
          vb-mt="auto"
          vb-display="flex"
          vb-align-items="center"
          vb-gap="1rem"
        >
          <ProductQtySelector />
          <AddToCartBtn />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProductMedia from './ProductMedia.vue';
import ProductHeader from './ProductHeader.vue';
import ProductSizeSelector from './ProductSizeSelector.vue';
import ProductDescription from './ProductDescription.vue';
import ProductQtySelector from './ProductQtySelector.vue';
import AddToCartBtn from './AddToCartBtn.vue';
</script>
