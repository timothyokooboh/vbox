<template>
  <div
    data-scope="product-media"
    vb-h="50vh"
    vb-position="relative"
    vb-bg-image="url(https://lh3.googleusercontent.com/aida-public/AB6AXuAlppFN5BODyDL2tmrrUPK5zdu5XBZIA0tmroi3O-CLXDMmNRctRfcgJK58d0bbrvhBYjlcZV9A-xW03kShBwyqGq75ujCBzFb7DWMrGtaRmwIhizMvx1Ui4GbrfksZwdBAXz9eFYGF9Vd30ch2C_TfNF-LWefyDEp7GN-X0sH-yh2aqc-WImiT0xlr012AfnOSmOrmJWjnB8w6JxptCwfE89_joas0HMRuAXfe8xj2qzCjI4yLHJj_497IOWj9js6VTQ1Tu-CEqwI)"
    vb-bg-size="cover"
    vb-bg-position="center"
    vb-border-top-left-radius="1.56rem"
    vb-border-top-right-radius="1.56rem"
    vb-py="1rem"
    vb-px="0.6rem"
    :vb-md="{
      px: '1.5rem',
    }"
  >
    <div
      vb-display="flex"
      vb-justify-content="space-between"
      vb-align-items="center"
    >
      <ProductMediaIcons>
        <span class="material-symbols-outlined">arrow_back</span>
      </ProductMediaIcons>

      <div vb-display="flex" vb-gap="sp-2" vb-align-items="center">
        <ProductMediaIcons>
          <span class="material-symbols-outlined">favorite</span>
        </ProductMediaIcons>

        <ProductMediaIcons>
          <span class="material-symbols-outlined">shopping_bag</span>
        </ProductMediaIcons>
      </div>
    </div>

    <CarouselIndicators />
  </div>
</template>

<script lang="ts" setup>
import ProductMediaIcons from './ProductMediaIcons.vue';
import CarouselIndicators from './CarouselIndicators.vue';
</script>
