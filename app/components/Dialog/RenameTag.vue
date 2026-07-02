<template>
  <PDialog
    :visible="!!dialogsStore.renameTag"
    modal
    :closable="!submitting_renameTag"
    :close-on-escape="!submitting_renameTag"
    header="Rename tag"
    @update:visible="$event || (dialogsStore.renameTag = null)"
    @show="tagName = dialogsStore.renameTag?.name ?? ''"
  >
    <form class="flex-stack gap-4" @submit.prevent="renameTag">
      <PIftaLabel>
        <PInputText v-model="tagName" autofocus :disabled="submitting_renameTag" />
        <label>Tag name</label>
      </PIftaLabel>
      <PButton
        label="Rename tag"
        type="submit"
        :loading="submitting_renameTag"
        :disabled="submitting_renameTag || !tagName.trim()"
      />
    </form>
  </PDialog>
</template>

<script setup lang="ts">
const tagName = ref<string>("");
const submitting_renameTag = ref(false);
const mainStore = useMainStore();
const dialogsStore = useDialogsStore();
const renameTag = async () => {
  if (!dialogsStore.renameTag) return;
  submitting_renameTag.value = true;
  try {
    await mainStore.renameTag(dialogsStore.renameTag.id, tagName.value.trim());
    tagName.value = "";
    dialogsStore.renameTag = null;
  } catch (error) {
    console.error(error);
  }
  submitting_renameTag.value = false;
};
</script>
