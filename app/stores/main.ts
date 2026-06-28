import Dexie, { type EntityTable } from "dexie";
// TODO refactor this slop somehow
export interface Expense {
  id: number;
  name?: string;
  amount: number;
  date: Date;
  createdAt: number;
}

export interface Tag {
  id: number;
  name?: string;
  createdAt: number;
}

export interface LinkExpenseTag {
  id: number;
  expenseId: number;
  tagId: number;
}

export interface ExpenseWithTags extends Expense {
  tags: Tag[];
}

class SpentDatabase extends Dexie {
  expenses!: EntityTable<Expense, "id">;
  tags!: EntityTable<Tag, "id">;
  linkExpenseTags!: EntityTable<LinkExpenseTag, "id">;

  constructor() {
    super("SpentDB");
    this.version(1).stores({
      expenses: "++id, date, createdAt",
      tags: "++id, name, createdAt",
      linkExpenseTags: "++id, expenseId, tagId, [expenseId+tagId]",
    });
  }
}

const _db = new SpentDatabase();

const excludeDuplicates = <T>(array: T[]): T[] => Array.from(new Set(array));

const chunkExpenses = (values: ExpenseWithTags[]): ExpensesBatchYear[] => {
  const years: ExpensesBatchYear[] = [];
  for (const expense of values) {
    const year = expense.date.getFullYear();
    const month = expense.date.getMonth();
    const day = expense.date.getDate();
    const yearObj = years.find((y) => y.year === year) ?? years[years.push({ year, months: [], sum: 0 }) - 1]!;
    const monthObj =
      yearObj.months.find((m) => m.month === month) ??
      yearObj.months[yearObj.months.push({ month, days: [], sum: 0 }) - 1]!;
    const dayObj =
      monthObj.days.find((d) => d.day === day) ?? monthObj.days[monthObj.days.push({ day, expenses: [], sum: 0 }) - 1]!;
    dayObj.expenses.push(expense);
  }
  // Sort newest to oldest
  years.sort((a, b) => b.year - a.year);
  years.forEach((year) => {
    year.months.sort((a, b) => b.month - a.month);
    year.months.forEach((month) => {
      month.days.sort((a, b) => b.day - a.day);
      month.days.forEach((day) => {
        day.expenses.sort((a, b) => b.id - a.id);
        day.sum = day.expenses.reduce((acc, expense) => acc + expense.amount, 0);
      });
      month.sum = month.days.reduce((acc, day) => acc + day.sum, 0);
    });
    year.sum = year.months.reduce((acc, month) => acc + month.sum, 0);
  });
  return years;
};

export type ExpensesBatchDay = { day: number; expenses: ExpenseWithTags[]; sum: number };
export type ExpensesBatchMonth = { month: number; days: ExpensesBatchDay[]; sum: number };
export type ExpensesBatchYear = { year: number; months: ExpensesBatchMonth[]; sum: number };

export const useMainStore = defineStore("main", () => {
  const tags = ref<Tag[]>([]);
  const tagsMap = computed(() => new Map(tags.value.map((t) => [t.id, t])));
  const expensesWithTags = ref<ExpenseWithTags[]>([]);
  const expensesChunked = computed(() => chunkExpenses(expensesWithTags.value));

  const fetchTags = async () => {
    tags.value = await _db.tags.orderBy("id").reverse().toArray();
  };

  const createTag = async (input: Pick<Tag, "name">): Promise<Tag> => {
    // return await _db.tags.add({ ...input, createdAt: Date.now() });
    const obj: Omit<Tag, "id"> = {
      ...input,
      createdAt: Date.now(),
    };
    const id = await _db.tags.add(obj);
    const tag: Tag = { ...obj, id };
    tags.value.unshift(tag);
    return tag;
  };

  /**
   * Optimistic
   */
  const deleteTag = async (id: number, policy: "cascade" | "restrict" = "restrict"): Promise<void> => {
    const index = tags.value.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Tag id ${id} not found to delete`);
    const [removedTag] = tags.value.splice(index, 1);
    if (!removedTag) throw new Error("Tags array integrity violated");
    try {
      await _db.transaction("rw", [_db.tags, _db.linkExpenseTags], async (tx) => {
        if (policy === "cascade") await tx.linkExpenseTags.where("tagId").equals(id).delete();
        else {
          const anyExists = await tx.linkExpenseTags.where("tagId").equals(id).first();
          if (anyExists) throw new Error("Tag is in use");
        }
        await tx.tags.where("id").equals(id).delete();
      });
    } catch (error) {
      tags.value.splice(index, 0, removedTag);
      throw error;
    }
  };

  const fetchExpenses = async () => {
    const expenses = await _db.expenses.orderBy("date").reverse().toArray();
    const links = await _db.linkExpenseTags
      .where("expenseId")
      .anyOf(excludeDuplicates(expenses.map((e) => e.id)))
      .toArray();

    const expenseIdToTagsMap = new Map<number, Tag[]>();
    for (const link of links) {
      const _tag = tagsMap.value.get(link.tagId);
      if (!_tag) throw new Error(`TAG_NOT_FOUND: ${link.tagId} for expense ${link.expenseId}`);
      if (!expenseIdToTagsMap.has(link.expenseId)) expenseIdToTagsMap.set(link.expenseId, []);
      expenseIdToTagsMap.get(link.expenseId)!.push(_tag);
    }
    expensesWithTags.value = expenses.map((expense) => ({
      ...expense,
      tags: expenseIdToTagsMap.get(expense.id) ?? [],
    }));
  };

  const createExpense = async (input: Pick<Expense, "name" | "amount" | "date"> & { tagIds: number[] }) => {
    const { tagIds, ...expenseData } = input;

    const created = await _db.transaction("rw", [_db.expenses, _db.linkExpenseTags], async (tx) => {
      const obj: Omit<Expense, "id"> = {
        ...expenseData,
        createdAt: Date.now(),
      };
      const id = await tx.expenses.add(obj);

      if (tagIds?.length) await tx.linkExpenseTags.bulkAdd(tagIds.map((tagId) => ({ expenseId: id, tagId })));

      return { ...obj, id, tags: tagIds.map((tagId) => tagsMap.value.get(tagId)!) };
    });
    expensesWithTags.value.unshift(created);
  };

  /**
   * Optimistic
   */
  const deleteExpense = async (id: number) => {
    const index = expensesWithTags.value.findIndex((expense) => expense.id === id);
    if (index === -1) throw new Error(`Expense id ${id} not found to delete`);
    const [removedExpense] = expensesWithTags.value.splice(index, 1);
    if (!removedExpense) throw new Error("Expenses array integrity violated");
    try {
      await _db.transaction("rw", [_db.expenses, _db.linkExpenseTags], async (tx) => {
        await tx.linkExpenseTags.where("expenseId").equals(id).delete();
        await tx.expenses.where("id").equals(id).delete();
      });
    } catch (error) {
      expensesWithTags.value.splice(index, 0, removedExpense);
      throw error;
    }
  };

  const updateExpense = async (
    existing: ExpenseWithTags,
    input: Pick<Expense, "name" | "amount" | "date"> & { tagIds: number[] },
  ) => {
    const { tagIds, ...expenseData } = input;
    const existingTagIds = existing.tags.map((tag) => tag.id);
    const newTagIds = tagIds.filter((tagId) => !existingTagIds.includes(tagId));
    const removedTagIds = existingTagIds.filter((tagId) => !tagIds.includes(tagId));
    const updated: ExpenseWithTags = await _db.transaction("rw", [_db.expenses, _db.linkExpenseTags], async (tx) => {
      await tx.expenses.where("id").equals(existing.id).modify(expenseData);
      if (newTagIds.length)
        await tx.linkExpenseTags.bulkAdd(newTagIds.map((tagId) => ({ expenseId: existing.id, tagId })));
      if (removedTagIds.length)
        await tx.linkExpenseTags
          .where("[expenseId+tagId]")
          .anyOf(removedTagIds.map((tagId) => [existing.id, tagId]))
          .delete();
      return { ...existing, ...expenseData, tags: tagIds.map((tagId) => tagsMap.value.get(tagId)!) };
    });
    expensesWithTags.value.splice(
      expensesWithTags.value.findIndex((expense) => expense.id === existing.id),
      1,
      updated,
    );
  };

  const tagIsInUse_cached = (id: number): boolean =>
    expensesWithTags.value.some((expense) => expense.tags.some((tag) => tag.id === id));

  const tagIsInUse = async (id: number): Promise<boolean> => {
    return !!(await _db.linkExpenseTags.where("tagId").equals(id).firstKey());
  };

  return {
    tags,
    expenses: expensesChunked,
    expensesFlat: expensesWithTags,
    fetchTags,
    createTag,
    deleteTag,
    tagIsInUse,
    tagIsInUse_cached,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,

    async exportDb() {
      const [expenses, allTags, links] = await Promise.all([
        _db.expenses.toArray(),
        _db.tags.toArray(),
        _db.linkExpenseTags.toArray(),
      ]);
      const blob = new Blob([JSON.stringify({ expenses, tags: allTags, linkExpenseTags: links }, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `spent-backup-${new Date().toISOString().slice(0, 10)}.json`; // e.g.
      a.click();
      URL.revokeObjectURL(url);
    },

    async importDb(file: File) {
      const text = await file.text();
      const data = JSON.parse(text) as {
        expenses: Expense[];
        tags: Tag[];
        linkExpenseTags: LinkExpenseTag[];
      };
      for (const e of data.expenses) {
        if (e.date && typeof e.date === "string") e.date = new Date(e.date);
      }
      await _db.transaction("rw", [_db.expenses, _db.tags, _db.linkExpenseTags], async (tx) => {
        await tx.expenses.clear();
        await tx.tags.clear();
        await tx.linkExpenseTags.clear();
        await tx.expenses.bulkAdd(data.expenses);
        await tx.tags.bulkAdd(data.tags);
        await tx.linkExpenseTags.bulkAdd(data.linkExpenseTags);
      });
      await fetchTags();
      await fetchExpenses();
    },

    async _resetDb() {
      await _db.expenses.clear();
      await _db.tags.clear();
      await _db.linkExpenseTags.clear();
      tags.value = [];
      expensesWithTags.value = [];
    },
    async _insertMockData() {
      const { id: tagId_grocery } = await createTag({ name: "Grocery" });
      const { id: tagId_transport } = await createTag({ name: "Transport" });
      const { id: tagId_entertainment } = await createTag({ name: "Entertainment" });
      const { id: tagId_alcohol } = await createTag({ name: "Alcohol" });

      const date = getTodayButMidnight();
      await createExpense({
        name: "Ramen",
        amount: 60,
        date,
        tagIds: [tagId_grocery, tagId_entertainment],
      });
      await createExpense({
        name: "Vodka",
        amount: 100,
        date,
        tagIds: [tagId_grocery, tagId_alcohol],
      });
      await createExpense({
        name: "Bread",
        amount: 50,
        date,
        tagIds: [tagId_grocery],
      });
      await createExpense({
        name: "Bus ticket",
        amount: 10,
        date,
        tagIds: [tagId_transport],
      });
    },
  };
});
