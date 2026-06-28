<template>
  <div class="w-full">
    <UniversalListItem
      v-if="!hideTitle"
      class="w-full font-bold"
      :icon="PrimeIcons.CALENDAR"
      :amount="dayObj.sum"
      :to="`/year-${year}/month-${month}/day-${dayObj.day}`"
    >
      <template #label>{{ format(new Date(year, month, dayObj.day), "d MMM") }}</template>
    </UniversalListItem>
    <UniversalListItem
      v-for="expense in dayObj.expenses"
      :key="expense.id"
      v-tooltip.top="expense.tags.map((tag) => tag.name).join(', ') || '???'"
      :label="expense.name || expense.tags.map((tag) => tag.name).join(', ') || '???'"
      :pt="{ 'label-class': !expense.name ? 'italic' : '' }"
      :amount="expense.amount"
      @click="dialogsStore.expense = expense.id"
    />
  </div>
</template>

<script setup lang="ts">
import { format } from "date-fns";
import { PrimeIcons } from "@primevue/core/api";
const dialogsStore = useDialogsStore();
defineProps<{
  hideTitle?: boolean;
  dayObj: ExpensesBatchDay;
  year: number;
  month: number;
}>();
</script>
