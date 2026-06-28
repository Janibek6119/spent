<template>
  <ListMonth :month-obj="monthObj" :year="yearObj.year" />
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
const monthObj = computed<ExpensesBatchMonth>(
  () =>
    yearObj.value.months.find((mo) => mo.month === Number(route.params.month)) ??
    ({ days: [], sum: 0, month: Number(route.params.month) } satisfies ExpensesBatchMonth),
);
</script>
