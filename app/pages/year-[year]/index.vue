<template>
  <ListYear :year-obj="yearObj" />
</template>

<script setup lang="ts">
const mainStore = useMainStore();
await mainStore.fetchExpenses();

const route = useRoute();

const yearObj = computed<ExpensesBatchYear>(
  () =>
    mainStore.expenses.find((yo) => yo.year === Number(route.params.year)) ??
    ({ months: [], sum: 0, year: Number(route.params.year) } satisfies ExpensesBatchYear),
);
</script>
