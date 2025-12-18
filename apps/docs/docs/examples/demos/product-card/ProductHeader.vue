<template>
  <v-box is="section" flex-grow="1">
    <v-box display="flex" flex-direction="column" gap="0.25rem">
      <v-box
        display="flex"
        justify-content="space-between"
        align-items="center"
        gap="0.25rem"
      >
        <v-box
          is="h2"
          fs="fs-3xl"
          fw="fw-bold"
          my="0"
          color="cl-text-product"
          class="vp-raw"
        >
          Urban Runner
        </v-box>

        <v-box is="span" fs="fs-2xl" fw="fw-bold" color="cl-text-product">
          $120.00
        </v-box>
      </v-box>

      <v-box
        display="flex"
        justify-content="space-between"
        align-items="center"
      >
        <v-box
          is="p"
          my="0"
          fs="fs-sm"
          fw="fw-medium"
          color="cl-gray-500"
          :dark="{
            color: 'cl-gray-400',
          }"
        >
          Men's Running Collection
        </v-box>

        <v-box display="flex" align-items="center" gap="0.25rem">
          <v-box
            is="span"
            color="cl-primary"
            fs="1rem"
            class="material-symbols-outlined"
            style="font-variation-settings: 'FILL' 1"
          >
            star
          </v-box>

          <v-box is="span" fs="fs-sm" fw="fw-bold" color="cl-text-product">
            4.8
          </v-box>

          <v-box
            is="span"
            fs="fs-xs"
            color="cl-gray-500"
            :dark="{
              color: 'cl-gray-400',
            }"
          >
            (120)
          </v-box>
        </v-box>
      </v-box>
    </v-box>
  </v-box>
</template>
