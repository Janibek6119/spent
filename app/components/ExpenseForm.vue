<template>
  <form class="flex-stack gap-4" @submit.prevent="submit">
    <div class="flex-stream gap-4">
      <PIftaLabel class="grow">
        <PDatePicker
          class="w-full"
          :model-value="getDateButMidnight(date, 'current')"
          date-format="d M yy"
          :manual-input="false"
          @update:model-value="date = getDateButMidnight($event as Date, 'utc')"
        />
        <!-- TODO place all visible words into i18n vocab across the project -->
        <label>Date</label>
      </PIftaLabel>
      <PButton
        class="shrink-0"
        :icon="PrimeIcons.MINUS"
        severity="secondary"
        outlined
        title="-1 day"
        @click="date = getDateButMidnight(addDays(date, -1), 'utc')"
      />
      <PButton
        class="shrink-0"
        :icon="PrimeIcons.PLUS"
        severity="secondary"
        outlined
        title="+1 day"
        @click="date = getDateButMidnight(addDays(date, 1), 'utc')"
      />
      <PButton
        class="shrink-0"
        label="Today"
        severity="contrast"
        :outlined="date.getTime() !== getTodayButMidnight().getTime()"
        @click="date = getTodayButMidnight()"
      />
      <PButton
        class="shrink-0"
        label="Yesterday"
        severity="contrast"
        :outlined="date.getTime() !== getYesterdayButMidnight().getTime()"
        @click="date = getYesterdayButMidnight()"
      />
    </div>
    <PIftaLabel>
      <PInputNumber
        v-model="amount"
        placeholder="0.00"
        :min-fraction-digits="2"
        :max-fraction-digits="2"
        fluid
        :min="0"
      />
      <label>Amount</label>
    </PIftaLabel>
    <PIftaLabel class="w-full">
      <PInputText
        v-model="name"
        class="w-full"
        :placeholder="
          Array.from(selectedTags)
            .map((id) => mainStore.tags.find((tag) => tag.id === id)?.name)
            .join(', ')
        "
      />
      <label>Note (optional)</label>
    </PIftaLabel>
    <div class="flex-stack gap-4">
      <div class="flex flex-wrap gap-2">
        <TagChip
          v-for="tag in mainStore.tags"
          :key="tag.id"
          :tag="tag"
          :selected="selectedTags.has(tag.id)"
          @contextmenu="tagContextMenuCallback($event, tag)"
          @click="toggleSelectedTags(tag.id)"
        />
        <PButton
          class="px-2 py-1"
          size="small"
          label="Add tag"
          severity="secondary"
          outlined
          :icon="PrimeIcons.PLUS"
          @click="dialogsStore.createTag = true"
        />
        <PContextMenu ref="tagContextMenu" :model="tagContextMenuItems" />
      </div>
    </div>
    <PDivider />
    <JButton
      :label="context === 'create' ? 'Create expense' : 'Update expense'"
      type="submit"
      :theme="context === 'create' ? 'default' : 'warn'"
      :loading="submitting"
      :disabled="!validatedInputs"
    />
  </form>
</template>

<script setup lang="ts">
import z from "zod";
import { addDays } from "date-fns";
import { PrimeIcons } from "@primevue/core/api";
import type { MenuItem } from "primevue/menuitem";
import type { ContextMenu } from "primevue";

const mainStore = useMainStore();
const dialogsStore = useDialogsStore();

const zExpense = z.object({
  amount: z.number().gt(0),
  date: z.date(),
  tagIds: z.array(z.number()),
  name: z.string().trim(),
});
export type ExpenseFormInputs = z.input<typeof zExpense>;

withDefaults(defineProps<{ submitting?: boolean; context?: "create" | "edit" }>(), {
  context: "create",
});
const emit = defineEmits<{
  submit: [inputs: ExpenseFormInputs];
}>();

const date = ref<Date>(getTodayButMidnight());
const amount = ref<number | null>(null);
const name = ref<string>("");
const selectedTags = ref<Set<number>>(new Set());
const toggleSelectedTags = (tagId: number) => {
  if (selectedTags.value.has(tagId)) selectedTags.value.delete(tagId);
  else selectedTags.value.add(tagId);
};
watch(mainStore.tags, (newVal) => {
  selectedTags.value = new Set(selectedTags.value.values().filter((id) => newVal.some((tag) => tag.id === id)));
});

const validatedInputs = computed(() => {
  const inputs: z.input<typeof zExpense> = {
    amount: amount.value ?? 0,
    date: date.value,
    tagIds: Array.from(selectedTags.value),
    name: name.value,
  };
  if (zExpense.safeParse(inputs).success) return inputs;
  return null;
});

// const submitting = ref(false);
// const submit = async () => {
//   submitting.value = true;
//   try {
//     const inputs = isFormValid.value;
//     if (!inputs) return;
//     await mainStore.createExpense(inputs);
//     amount.value = 0;
//     name.value = "";
//     selectedTags.value.clear();
//   } catch (error) {
//     console.error(error);
//   }
//   submitting.value = false;
// };

const submit = async () => {
  if (!validatedInputs.value) return;
  emit("submit", validatedInputs.value);
};

const tagContextMenu = ref<InstanceType<typeof ContextMenu>>();
const tagContextMenuItems = ref<MenuItem[]>([
  {
    label: "Delete",
    icon: PrimeIcons.TRASH,
    disabled: () => mainStore.tagIsInUse_cached(tagContextMenuObject.value!.id),
    command: () => {
      mainStore.deleteTag(tagContextMenuObject.value!.id, "cascade");
    },
  },
]);
const tagContextMenuObject = ref<Tag | null>(null);
const tagContextMenuCallback = (event: MouseEvent, tag: Tag) => {
  tagContextMenuObject.value = tag;
  tagContextMenu.value?.show(event);
};

defineExpose({
  fill: (expense: ExpenseWithTags) => {
    date.value = expense.date;
    amount.value = expense.amount;
    name.value = expense.name ?? "";
    selectedTags.value = new Set(expense.tags.map((tag) => tag.id));
  },
  reset: (
    opts: {
      /** @default false */
      resetDate?: boolean;
    } = {},
  ) => {
    const DEFAULT_OPTS = {
      resetDate: false,
    };
    const { resetDate } = { ...DEFAULT_OPTS, ...opts };
    if (resetDate) date.value = getTodayButMidnight();
    amount.value = null;
    name.value = "";
    selectedTags.value.clear();
  },
});
</script>
