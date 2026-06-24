<template>
  <table class="j-table" :class="{ 'j-table--striped': striped }">
    <thead>
      <tr>
        <th v-for="column in columns" :key="column.key" :class="column.headerClass">
          <!-- @vue-ignore (dynamic slot name can't be statically indexed; consumers stay strict) -->
          <slot :name="`header-${column.key}`" :column="column">
            {{ column.header }}
          </slot>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, index) in rows" :key="resolveRowKey(row, index)">
        <td v-for="column in columns" :key="column.key" class="j-table__td" :class="column.class">
          <!-- @vue-ignore (dynamic slot name can't be statically indexed; consumers stay strict) -->
          <slot :name="`cell-${column.key}`" :row="row" :value="getValue(row, column.key)" :index="index">
            {{ getValue(row, column.key) }}
          </slot>
        </td>
      </tr>
      <tr v-if="!rows.length" class="j-table__row--empty">
        <td :colspan="columns.length">
          <slot name="empty">{{ emptyText ?? "Empty" }}</slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts" generic="TRow extends Record<string, unknown>, TKey extends string = string">
export interface JTableColumn<K extends string = string> {
  key: K;
  header?: string;
  class?: string;
  headerClass?: string;
}

const props = defineProps<{
  /**
   * Pass via `defineTableColumns([...])` (auto-imported). That preserves the `key` literals;
   * otherwise they widen to `string` and the guard below turns this prop into a compile error
   * instead of silently disabling slot-name checking.
   */
  columns: readonly JTableColumn<TKey>[] &
    (string extends TKey
      ? "JTable: column keys widened to `string` — build them with `defineTableColumns([...])`"
      : unknown);
  rows: readonly TRow[];
  rowKey?: keyof TRow | ((row: TRow, index: number) => PropertyKey);
  emptyText?: string;
  striped?: boolean;
}>();

defineSlots<
  {
    empty?: () => unknown;
  } & {
    [K in TKey as `header-${K}`]?: (slotProps: { column: JTableColumn<K> }) => unknown;
  } & {
    [K in TKey as `cell-${K}`]?: (slotProps: {
      row: TRow;
      value: K extends keyof TRow ? TRow[K] : unknown;
      index: number;
    }) => unknown;
  }
>();

const getValue = (row: TRow, key: TKey) => row[key as unknown as keyof TRow];

const resolveRowKey = (row: TRow, index: number): PropertyKey => {
  if (typeof props.rowKey === "function") return props.rowKey(row, index);
  if (props.rowKey) return row[props.rowKey] as PropertyKey;
  if ("id" in row) return row.id as PropertyKey;
  return index;
};
</script>

<style scoped>
@reference "~/assets/css/main.css";
@layer components {
  table.j-table {
    @apply border-collapse;
  }
  table.j-table > thead > tr > th {
    @apply text-left;
  }

  table.j-table.j-table--striped tbody > tr:nth-child(even) {
    @apply bg-gray-500/20;
  }

  table.j-table > tbody > tr > td,
  table.j-table > thead > tr > th {
    @apply px-4 py-2 whitespace-nowrap;
  }

  table.j-table > tbody > tr.j-table__row--empty > td {
    @apply text-center italic opacity-50;
  }
}
</style>
