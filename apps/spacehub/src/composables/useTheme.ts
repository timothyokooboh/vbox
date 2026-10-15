import { computed, ref } from 'vue';

const STORAGE_KEY = 'spacehub-theme';

const getInitialDark = () => {
  if (typeof window === 'undefined') return false;
  const fromStorage = window.localStorage.getItem(STORAGE_KEY);
  if (fromStorage === 'dark') return true;
  if (fromStorage === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const isDark = ref(getInitialDark());

const syncDom = () => {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', isDark.value);
  document.documentElement.style.colorScheme = isDark.value ? 'dark' : 'light';
};

syncDom();

export const useTheme = () => {
  const setTheme = (nextDark: boolean) => {
    isDark.value = nextDark;
    syncDom();
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, nextDark ? 'dark' : 'light');
    }
  };

  const toggleTheme = () => {
    setTheme(!isDark.value);
  };

  return {
    isDark: computed(() => isDark.value),
    setTheme,
    toggleTheme,
  };
};
