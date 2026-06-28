<template>
  <ListDay :day-obj="dayObj" :month="monthObj.month" :year="yearObj.year" />
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
const dayObj = computed<ExpensesBatchDay>(
  () =>
    monthObj.value.days.find((_do) => _do.day === Number(route.params.day)) ??
    ({ expenses: [], sum: 0, day: Number(route.params.day) } satisfies ExpensesBatchDay),
);
</script>
