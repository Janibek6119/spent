export const useDialogsStore = defineStore("dialogs", () => {
  const createTag = ref(false);
  const expense = ref<number | null>(null);
  const tagStats = ref(false);
  return {
    createTag,
    expense,
    tagStats,
  };
});
