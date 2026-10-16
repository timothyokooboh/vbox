<template>
  <div
    data-scope="product-details"
    vb-position="relative"
    vb-z-index="10"
    vb-mt="-1.5rem"
    vb-display="flex"
    vb-flex-direction="column"
    vb-gap="1rem"
    vb-border-top-right-radius="1.5rem"
    vb-border-top-left-radius="1.5rem"
    vb-px="0.6rem"
    vb-pt="2rem"
    vb-pb="1.5rem"
    vb-shadow="0 -10px 40px -15px rgba(0,0,0,0.3)"
    vb-bg="#fff"
    :vb-dark="{
      bg: '#23220F',
    }"
    :vb-md="{
      px: '1.5rem',
    }"
  >
    <slot />
  </div>
</template>
