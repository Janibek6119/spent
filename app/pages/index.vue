<template>
  <div class="flex-stack items-center">
    <ListYear v-for="yearObj in mainStore.expenses" :key="`year-${yearObj.year}`" :year-obj="yearObj" />
  </div>
</template>

<script setup lang="ts">
const mainStore = useMainStore();
await mainStore.fetchExpenses();
</script>
