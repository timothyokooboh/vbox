<template>
  <v-box
    is="section"
    role="alert"
    data-scope="banner-root"
    display="flex"
    flex-direction="column"
    gap="0.8rem"
    ff="ff-sans"
    radius="0.5rem"
    bg="#FEF5F5"
    border="1px solid #FCCFCF"
    p="1rem"
    :dark="{
      bg: '#FCCFCF',
    }"
  >
    <BannerHeader />
    <BannerBody />
    <BannerFooter />
  </v-box>
</template>

<script lang="ts" setup>
import BannerHeader from './BannerHeader.vue';
import BannerBody from './BannerBody.vue';
import BannerFooter from './BannerFooter.vue';
</script>
