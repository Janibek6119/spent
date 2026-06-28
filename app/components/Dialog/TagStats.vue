<template>
  <PDialog v-model:visible="dialogsStore.tagStats" modal header="Tag statistics" class="max-w-140">
    <div class="flex-stack gap-4">
      <div class="flex flex-wrap gap-2">
        <PButton
          v-for="preset in presets"
          :key="preset.label"
          :label="preset.label"
          size="small"
          severity="secondary"
          :outlined="!isPresetActive(preset)"
          @click="applyPreset(preset)"
        />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <PIftaLabel class="grow">
          <PDatePicker
            class="w-full"
            :model-value="getDateButMidnight(from, 'current')"
            date-format="d M yy"
            :manual-input="false"
            @update:model-value="from = getDateButMidnight($event as Date, 'utc')"
          />
          <label>From</label>
        </PIftaLabel>
        <PIftaLabel class="grow">
          <PDatePicker
            class="w-full"
            :model-value="to ? getDateButMidnight(to, 'current') : null"
            date-format="d M yy"
            :manual-input="false"
            show-clear
            @update:model-value="to = $event ? getDateButMidnight($event as Date, 'utc') : null"
          />
          <label>To</label>
        </PIftaLabel>
      </div>
      <table v-if="stats.length" class="w-full">
        <thead>
          <tr>
            <th class="text-left">Tag</th>
            <th class="text-right">Total</th>
            <th class="text-right">Share</th>
          </tr>
        </thead>
        <tbody>
          <tr class="font-bold">
            <td>Total</td>
            <td class="text-right font-mono">{{ grandTotal.toFixed(2) }}</td>
            <td />
          </tr>
          <tr v-for="row in stats" :key="row.tag.id">
            <td><TagChip :tag="row.tag" /></td>
            <td class="text-right font-mono">{{ row.total.toFixed(2) }}</td>
            <td class="text-right font-mono">{{ (row.share * 100).toFixed(1) }}%</td>
          </tr>
          <tr class="font-bold">
            <td>Total</td>
            <td class="text-right font-mono">{{ grandTotal.toFixed(2) }}</td>
            <td />
          </tr>
        </tbody>
      </table>
      <p v-else class="opacity-50">No expenses in this period.</p>
    </div>
  </PDialog>
</template>

<script setup lang="ts">
const dialogsStore = useDialogsStore();
const mainStore = useMainStore();

const now = new Date();
const y = now.getFullYear();
const m = now.getMonth();

interface Preset {
  label: string;
  range: () => DateRange;
}

const presets: Preset[] = [
  { label: "This Month", range: () => getMonthRange(y, m) },
  { label: "Last Month", range: () => getMonthRange(m === 0 ? y - 1 : y, m === 0 ? 11 : m - 1) },
  { label: "This Year", range: () => getYearRange(y) },
  { label: "Last Year", range: () => getYearRange(y - 1) },
  { label: "All Time", range: () => [new Date(0), null] },
];

const [_f, _t] = getMonthRange(y, m);
const from = ref<Date>(_f);
const to = ref<Date | null>(_t);

const applyPreset = (preset: Preset) => {
  const [f, t] = preset.range();
  from.value = f;
  to.value = t;
};
const isPresetActive = (preset: Preset) => {
  const [f, t] = preset.range();
  return from.value.getTime() === f.getTime() && to.value?.getTime() === t?.getTime();
};

const chosenPeriodExpenses = computed(() =>
  mainStore.expensesFlat.filter(
    (e) => e.date.getTime() >= from.value.getTime() && (to.value === null || e.date.getTime() <= to.value.getTime()),
  ),
);

const grandTotal = computed(() => chosenPeriodExpenses.value.reduce((sum, e) => sum + e.amount, 0));

const stats = computed<{ tag: Tag; total: number; share: number }[]>(() => {
  const tagTotals = new Map<number, number>(mainStore.tags.map((t) => [t.id, 0]));
  chosenPeriodExpenses.value.forEach(({ amount, tags }) =>
    tags.forEach(({ id }) => tagTotals.set(id, tagTotals.get(id)! + amount)),
  );

  return Array.from(tagTotals.entries())
    .map(([tagId, tagTotal]) => ({
      tag: mainStore.tags.find((t) => t.id === tagId)!,
      total: tagTotal,
      share: grandTotal.value > 0 ? tagTotal / grandTotal.value : 0,
    }))
    .filter((r) => r.tag)
    .sort((a, b) => b.total - a.total);
});
</script>

<style scoped>
@reference "tailwindcss";
table th,
table td {
  @apply px-2 py-1;
}
thead tr {
  border-bottom: 1px solid var(--p-surface-200);
}
:root.dark thead tr {
  border-bottom-color: var(--p-surface-700);
}
tbody tr:not(:last-child) {
  border-bottom: 1px solid var(--p-surface-100);
}
:root.dark tbody tr:not(:last-child) {
  border-bottom-color: var(--p-surface-800);
}
</style>
