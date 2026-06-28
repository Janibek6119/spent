<template>
  <PDialog
    v-model:visible="visible"
    modal
    header="Expense details"
    class="max-w-120"
    :close-on-escape="!editing"
    @hide="onHide"
  >
    <PDrawer
      v-model:visible="editing"
      header="Edit expense"
      position="full"
      @hide="editExpenseForm?.reset()"
      @show="editExpenseForm?.fill(expense!)"
    >
      <ExpenseForm ref="editExpenseForm" context="edit" :submitting="submitting_editExpense" @submit="editExpense" />
    </PDrawer>
    <table v-if="expense" class="w-full" style="border-collapse: separate; border-spacing: 8px">
      <tbody>
        <tr>
          <td>Name</td>
          <td>{{ expense.name }}</td>
        </tr>
        <tr>
          <td>Amount</td>
          <td class="font-mono">{{ expense.amount.toFixed(2) }}</td>
        </tr>
        <tr>
          <td>Date</td>
          <td>{{ format(expense.date, "d MMM yyyy") }}</td>
        </tr>
        <tr>
          <td>Tags</td>
          <td>
            <div class="flex flex-wrap gap-2">
              <TagChip v-for="tag in expense.tags" :key="tag.id" :tag="tag" />
            </div>
          </td>
        </tr>
        <tr class="italic">
          <td>Created at</td>
          <td class="opacity-50">{{ format(expense.createdAt, "d MMM yyyy HH:mm:ss") }}</td>
        </tr>
      </tbody>
    </table>
    <PMessage v-else severity="error">No data</PMessage>
    <template #footer>
      <div class="grid w-full grid-cols-2 gap-2">
        <JButton label="Edit" theme="warn-outlined" :icon="PrimeIcons.PENCIL" @click="editing = true" />
        <JHoldButton label="Delete" theme="default-outlined" :icon="PrimeIcons.TRASH" @click="deleteExpense" />
      </div>
    </template>
  </PDialog>
</template>

<script setup lang="ts">
import { format } from "date-fns";
import { PrimeIcons } from "@primevue/core/api";
import type ExpenseForm from "~/components/ExpenseForm.vue";
import type { ExpenseFormInputs } from "~/components/ExpenseForm.vue";
import type { ToastMessageOptions } from "primevue";
const dialogsStore = useDialogsStore();
const mainStore = useMainStore();
const toast = useToast();
const visible = computed<boolean>({
  get() {
    return !!dialogsStore.expense;
  },
  set(value) {
    if (!value) dialogsStore.expense = null;
    else console.warn("Expense dialog is not implemented");
  },
});
const expense = computed<ExpenseWithTags | null>(() =>
  dialogsStore.expense ? (mainStore.expensesFlat.find((e) => e.id === dialogsStore.expense) ?? null) : null,
);

const editExpenseForm = ref<InstanceType<typeof ExpenseForm>>();
const editing = ref(false);

const submitting_editExpense = ref(false);
const editExpense = async (inputs: ExpenseFormInputs) => {
  submitting_editExpense.value = true;
  try {
    await mainStore.updateExpense(expense.value!, inputs);
    editing.value = false;
  } catch (error) {
    console.error(error);
  }
  submitting_editExpense.value = false;
};
const deleteOnHide = ref<number | null>(null);
const onHide = () => {
  if (deleteOnHide.value !== null) {
    const _id = deleteOnHide.value;
    deleteOnHide.value = null;
    const deletingToast: ToastMessageOptions = {
      severity: "info",
      summary: "Deleting...",
    };
    toast.add(deletingToast);
    mainStore
      .deleteExpense(_id)
      .then(() => {
        toast.add({ severity: "success", summary: "Deleted", life: 3000 });
      })
      .catch((error) => {
        console.error(error);
        toast.add({ severity: "error", summary: "Error", life: 3000 });
      })
      .finally(() => {
        toast.remove(deletingToast);
      });
  }
};
const deleteExpense = () => {
  deleteOnHide.value = expense.value!.id;
  visible.value = false;
};
</script>

<style scoped>
@reference "tailwindcss";
tr td:first-child {
  @apply font-semibold opacity-50;
}
</style>
