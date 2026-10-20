import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUiStore = defineStore('ui', () => {
  const searchOpen = ref(false);
  const searchValue = ref('');

  const setSearchOpen = (open: boolean) => {
    searchOpen.value = open;
  };

  const setSearchValue = (value: string) => {
    searchValue.value = value;
  };

  return {
    searchOpen,
    searchValue,
    setSearchOpen,
    setSearchValue
  };
});
