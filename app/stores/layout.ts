export const useLayoutStore = defineStore(
  "layout",
  () => {
    const darkMode = ref(false);
    return {
      darkMode,
    };
  },
  {
    persist: true,
  },
);
