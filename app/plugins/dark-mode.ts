export default defineNuxtPlugin(() => {
  const layoutStore = useLayoutStore();
  const updateHTMLClass = (isDark: boolean) => {
    if (import.meta.client) document.documentElement.classList.toggle("dark", isDark);
  };
  watch(() => layoutStore.darkMode, updateHTMLClass, { immediate: true });
});
