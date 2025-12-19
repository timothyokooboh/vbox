<template>
  <v-box
    data-scope="product-media"
    h="50vh"
    position="relative"
    bg-image="url(https://lh3.googleusercontent.com/aida-public/AB6AXuAlppFN5BODyDL2tmrrUPK5zdu5XBZIA0tmroi3O-CLXDMmNRctRfcgJK58d0bbrvhBYjlcZV9A-xW03kShBwyqGq75ujCBzFb7DWMrGtaRmwIhizMvx1Ui4GbrfksZwdBAXz9eFYGF9Vd30ch2C_TfNF-LWefyDEp7GN-X0sH-yh2aqc-WImiT0xlr012AfnOSmOrmJWjnB8w6JxptCwfE89_joas0HMRuAXfe8xj2qzCjI4yLHJj_497IOWj9js6VTQ1Tu-CEqwI)"
    bg-size="cover"
    bg-position="center"
    border-top-left-radius="1.56rem"
    border-top-right-radius="1.56rem"
    py="1rem"
    px="0.6rem"
    :md="{
      px: '1.5rem',
    }"
  >
    <v-box display="flex" justify-content="space-between" align-items="center">
      <ProductMediaIcons>
        <span class="material-symbols-outlined">arrow_back</span>
      </ProductMediaIcons>

      <v-box display="flex" gap="sp-2" align-items="center">
        <ProductMediaIcons>
          <span class="material-symbols-outlined">favorite</span>
        </ProductMediaIcons>

        <ProductMediaIcons>
          <span class="material-symbols-outlined">shopping_bag</span>
        </ProductMediaIcons>
      </v-box>
    </v-box>

    <CarouselIndicators />
  </v-box>
</template>

<script lang="ts" setup>
import ProductMediaIcons from './ProductMediaIcons.vue';
import CarouselIndicators from './CarouselIndicators.vue';
</script>
