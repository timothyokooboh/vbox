import { computed, onScopeDispose, ref, watchEffect } from 'vue';
import {
  createSharedComposable,
  useEventListener,
  usePreferredReducedMotion,
} from '@vueuse/core';

export const useMotionPreferences = createSharedComposable(() => {
  const reduced = usePreferredReducedMotion();
  const pointer = ref(false);
  useEventListener('pointerdown', () => {
    pointer.value = true;
  });
  useEventListener('pointermove', (event) => {
    if (event.pointerType === 'mouse' && !pointer.value) pointer.value = true;
  });
  useEventListener('keydown', () => {
    pointer.value = false;
  });
  watchEffect(() => {
    if (typeof document !== 'undefined')
      document.documentElement.dataset.input = pointer.value
        ? 'pointer'
        : 'keyboard';
  });
  onScopeDispose(() => {
    if (typeof document !== 'undefined')
      delete document.documentElement.dataset.input;
  });
  return {
    allowViewTransition: computed(
      () => pointer.value && reduced.value === 'no-preference',
    ),
  };
});
