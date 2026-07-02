export const useDialogsStore = defineStore("dialogs", () => {
  const createTag = ref(false);
  const renameTag = ref<Tag | null>(null);
  const expense = ref<number | null>(null);
  const tagStats = ref(false);
  return {
    createTag,
    renameTag,
    expense,
    tagStats,
  };
});
