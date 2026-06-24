import type { JTableColumn } from "~/components/JTable.vue";

/**
 * Identity helper that preserves column `key` literals (so JTable slot names stay
 * type-checked) while validating the column shape. Auto-imported by Nuxt.
 *
 * The mapped parameter type rejects unknown properties (a plain `const C extends
 * JTableColumn[]` generic would let excess props through, since that's only an
 * assignability check).
 */
export const defineTableColumns = <const C extends readonly JTableColumn[]>(columns: {
  [I in keyof C]: C[I] & Record<Exclude<keyof C[I], keyof JTableColumn>, never>;
}): C => columns as unknown as C;
