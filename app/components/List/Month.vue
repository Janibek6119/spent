<template>
  <div class="w-full">
    <UniversalListItem
      class="w-full font-bold"
      :icon="PrimeIcons.CALENDAR"
      :amount="monthObj.sum"
      :to="`/year-${year}/month-${monthObj.month}`"
    >
      <template #label>{{ format(new Date(year, monthObj.month, 1), "MMMM yyyy") }}</template>
    </UniversalListItem>
    <ListDay
      v-for="dayObj in monthObj.days"
      :key="`day-${dayObj.day}`"
      :day-obj="dayObj"
      :year="year"
      :month="monthObj.month"
    />
  </div>
</template>

<script setup lang="ts">
import { format } from "date-fns";
import { PrimeIcons } from "@primevue/core/api";
defineProps<{
  monthObj: ExpensesBatchMonth;
  year: number;
}>();
</script>
