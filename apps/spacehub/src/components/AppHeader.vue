<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'radix-vue';
import { RouterLink } from 'vue-router';
import { useTheme } from '@/composables/useTheme';
import BaseButton from './BaseButton.vue';

const { isDark, toggleTheme } = useTheme();
</script>

<template>
  <header
    position="sticky"
    top="0"
    z-index="z-header"
    px="sp-4"
    :sm="{ paddingInline: 'var(--spacing-6)' }"
    py="sp-3"
    bg="color-mix(in oklab, var(--color-canvas) 84%, transparent)"
    glass="blur(14px)"
    border-bottom="1px solid color-mix(in oklab, var(--color-ink) 12%, transparent)"
  >
    <div
      display="flex"
      flex-wrap="wrap"
      align-items="center"
      justify-content="space-between"
      gap="sp-3"
      max-width="86rem"
      mx="auto"
    >
      <RouterLink to="/" text-decoration="none" color="cl-ink">
        <p m="0" fw="900" fs="clamp(1.3rem,4vw,2rem)" ls="0.01em">
          Space Missions & Astronomy Hub
        </p>
      </RouterLink>

      <nav display="flex" align-items="center" gap="sp-2" aria-label="Primary">
        <BaseButton as="router-link" to="/" variant="ghost" size="sm">Home</BaseButton>
        <BaseButton as="router-link" to="/launches" variant="outline" size="sm">Launches</BaseButton>

        <label display="inline-flex" align-items="center" gap="sp-2" color="cl-ink">
          <span fs="fs-sm">{{ isDark ? 'Dark' : 'Light' }}</span>
          <SwitchRoot
            :checked="isDark"
            @update:checked="toggleTheme"
            aria-label="Toggle color theme"
            w="3.1rem"
            h="1.8rem"
            border-radius="br-pill"
            bg="color-mix(in oklab, var(--color-ink) 24%, transparent)"
            display="inline-flex"
            align-items="center"
            p="2px"
            cursor="pointer"
            :focus-visible="{ outline: 'none', boxShadow: 'var(--box-shadow-focus)' }"
          >
            <SwitchThumb
              :style="{ transform: isDark ? 'translateX(1.25rem)' : 'translateX(0)' }"
              display="block"
              w="1.4rem"
              h="1.4rem"
              bg="var(--color-surface)"
              border-radius="50%"
              transition="transform 200ms ease"
            />
          </SwitchRoot>
        </label>
      </nav>
    </div>
  </header>
</template>
