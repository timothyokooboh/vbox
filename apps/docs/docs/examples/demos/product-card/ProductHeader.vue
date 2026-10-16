<template>
  <section data-scope="product-header" vb-flex-grow="1">
    <div vb-display="flex" vb-flex-direction="column" vb-gap="0.25rem">
      <div
        vb-display="flex"
        vb-justify-content="space-between"
        vb-align-items="center"
        vb-gap="0.25rem"
      >
        <h2
          vb-fs="fs-3xl"
          vb-fw="fw-bold"
          vb-lh="lh-snug"
          vb-my="0"
          vb-color="cl-text-product"
          class="vp-raw"
        >
          Urban Runner
        </h2>

        <span vb-fs="fs-2xl" vb-fw="fw-bold" vb-color="cl-text-product">
          $120.00
        </span>
      </div>

      <div
        vb-display="flex"
        vb-justify-content="space-between"
        vb-align-items="center"
      >
        <p
          vb-my="0"
          vb-fs="fs-sm"
          vb-fw="fw-medium"
          vb-color="cl-gray-500"
          :vb-dark="{
            color: 'cl-gray-400',
          }"
        >
          Men's Running Collection
        </p>

        <div vb-display="flex" vb-align-items="center" vb-gap="0.25rem">
          <span
            vb-color="cl-primary"
            vb-fs="1rem"
            class="material-symbols-outlined"
            style="font-variation-settings: 'FILL' 1"
          >
            star
          </span>

          <span vb-fs="fs-sm" vb-fw="fw-bold" vb-color="cl-text-product">
            4.8
          </span>

          <span
            vb-fs="fs-xs"
            vb-color="cl-gray-500"
            :vb-dark="{
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
