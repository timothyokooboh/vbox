<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from 'radix-vue';
import { ref } from 'vue';

defineProps<{
  title: string;
  description: string;
  imageUrl: string;
}>();

const open = ref(false);
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger as-child>
      <button
        type="button"
        w="100%"
        p="0"
        bg="transparent"
        border="0"
        cursor="pointer"
        text-align="left"
        :focus-visible="{
          outline: 'none',
          boxShadow: 'var(--box-shadow-focus)',
          borderRadius: 'var(--border-radius-md)',
        }"
      >
        <slot />
      </button>
    </DialogTrigger>

    <DialogPortal>
      <DialogOverlay
        position="fixed"
        inset="0"
        z="z-modal"
        bg="color-mix(in oklab, black 72%, transparent)"
      />
      <DialogContent
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="min(62rem, 94vw)"
        max-h="88vh"
        overflow="auto"
        z="calc(var(--z-index-modal) + 1)"
        bg="var(--color-surface)"
        border="1px solid color-mix(in oklab, var(--color-ink) 16%, transparent)"
        border-radius="br-xl"
        p="sp-4"
        :sm="{ padding: 'var(--spacing-5)' }"
      >
        <DialogTitle m="0" color="cl-ink" fs="fs-h2">{{ title }}</DialogTitle>
        <DialogDescription
          mt="sp-2"
          mb="sp-3"
          color="color-mix(in oklab, var(--color-ink) 72%, transparent)"
        >
          {{ description }}
        </DialogDescription>

        <img
          :src="imageUrl"
          :alt="title"
          w="100%"
          h="auto"
          border-radius="br-md"
          loading="lazy"
        />

        <DialogClose as-child>
          <button
            type="button"
            mt="sp-4"
            px="sp-3"
            py="sp-2"
            border-radius="br-pill"
            bg="var(--color-surfaceMuted)"
            border="1px solid color-mix(in oklab, var(--color-ink) 14%, transparent)"
            color="cl-ink"
            cursor="pointer"
            :focus-visible="{
              outline: 'none',
              boxShadow: 'var(--box-shadow-focus)',
            }"
          >
            Close Preview
          </button>
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
