<template>
  <div class="flex-stack container mx-auto min-h-screen gap-4 p-4">
    <AppTopbar class="z-10 shadow-lg" />
    <div class="grid grid-cols-2 justify-center gap-4 px-4">
      <slot />
      <ExpenseForm ref="expenseForm" class="sticky top-4 h-fit" :submitting="submitting" @submit="submit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExpenseFormInputs } from "~/components/ExpenseForm.vue";
import type ExpenseForm from "~/components/ExpenseForm.vue";

const expenseForm = ref<InstanceType<typeof ExpenseForm>>();
const mainStore = useMainStore();
const submitting = ref(false);
const submit = async (inputs: ExpenseFormInputs) => {
  submitting.value = true;
  try {
    await mainStore.createExpense(inputs);
    expenseForm.value?.reset();
  } catch (error) {
    console.error(error);
  }
  submitting.value = false;
};
</script>
