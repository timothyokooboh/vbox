import { computed } from 'vue';
import { useDark, useToggle } from '@vueuse/core';

export const useTheme = () => {
  const isDark = useDark({
    selector: 'html',
    attribute: 'class',
    valueDark: 'dark',
    valueLight: '',
    initialValue: 'dark',
  });

  const toggleDark = useToggle(isDark);

  const toggleTheme = () => {
    toggleDark();
  };

  return {
    isDark: computed(() => isDark.value),
    toggleTheme,
  };
};
