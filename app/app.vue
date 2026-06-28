<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <PToast />
  <DialogCreateTag />
  <DialogExpense />
  <DialogTagStats />
</template>

<script setup lang="ts">
const layoutStore = useLayoutStore();
useHead({
  htmlAttrs: {
    class: layoutStore.darkMode ? "dark" : "",
  },
});

const mainStore = useMainStore();
await mainStore.fetchTags();
</script>
