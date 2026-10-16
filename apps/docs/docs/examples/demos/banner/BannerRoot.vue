<template>
  <section
    role="alert"
    data-scope="banner-root"
    vb-display="flex"
    vb-flex-direction="column"
    vb-gap="0.8rem"
    vb-ff="ff-sans"
    vb-radius="0.5rem"
    vb-bg="#FEF5F5"
    vb-border="1px solid #FCCFCF"
    vb-p="1rem"
    :vb-dark="{
      bg: '#FCCFCF',
    }"
  >
    <BannerHeader />
    <BannerBody />
    <BannerFooter />
  </section>
</template>

<script lang="ts" setup>
import BannerHeader from './BannerHeader.vue';
import BannerBody from './BannerBody.vue';
import BannerFooter from './BannerFooter.vue';
</script>
