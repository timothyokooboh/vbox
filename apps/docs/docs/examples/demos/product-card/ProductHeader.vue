<template>
  <section data-scope="product-header" flex-grow="1">
    <div display="flex" flex-direction="column" gap="0.25rem">
      <div
        display="flex"
        justify-content="space-between"
        align-items="center"
        gap="0.25rem"
      >
        <h2
          fs="fs-3xl"
          fw="fw-bold"
          lh="lh-snug"
          my="0"
          color="cl-text-product"
          class="vp-raw"
        >
          Urban Runner
        </h2>

        <span fs="fs-2xl" fw="fw-bold" color="cl-text-product"> $120.00 </span>
      </div>

      <div display="flex" justify-content="space-between" align-items="center">
        <p
          my="0"
          fs="fs-sm"
          fw="fw-medium"
          color="cl-gray-500"
          :dark="{
            color: 'cl-gray-400',
          }"
        >
          Men's Running Collection
        </p>

        <div display="flex" align-items="center" gap="0.25rem">
          <span
            color="cl-primary"
            fs="1rem"
            class="material-symbols-outlined"
            style="font-variation-settings: 'FILL' 1"
          >
            star
          </span>

          <span fs="fs-sm" fw="fw-bold" color="cl-text-product"> 4.8 </span>

          <span
            fs="fs-xs"
            color="cl-gray-500"
            :dark="{
              color: 'cl-gray-400',
            }"
          >
            (120)
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
