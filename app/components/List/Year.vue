<template>
  <div class="w-full">
    <UniversalListItem
      class="w-full font-bold"
      :icon="PrimeIcons.CALENDAR"
      :amount="yearObj.sum"
      :to="`/year-${yearObj.year}`"
    >
      <template #label>{{ format(new Date(yearObj.year, 0, 1), "yyyy") }}</template>
    </UniversalListItem>
    <ListMonth
      v-for="monthObj in yearObj.months"
      :key="`month-${monthObj.month}`"
      :month-obj="monthObj"
      :year="yearObj.year"
      :title="format(new Date(yearObj.year, monthObj.month, 1), 'MMMM yyyy')"
      :to="`/year-${yearObj.year}/month-${monthObj.month}`"
    />
  </div>
</template>

<script setup lang="ts">
import { format } from "date-fns";
import { PrimeIcons } from "@primevue/core/api";
defineProps<{
  yearObj: ExpensesBatchYear;
}>();
</script>
