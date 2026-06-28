<template>
  <PDialog
    v-model:visible="dialogsStore.createTag"
    modal
    :closable="!submitting_createTag"
    :close-on-escape="!submitting_createTag"
    header="Create tag"
  >
    <form class="flex-stack gap-4" @submit.prevent="createTag">
      <PIftaLabel>
        <!-- TODO Replace PrimeVue inputs and buttons with J where possible across the project -->
        <PInputText v-model="tagName" autofocus :disabled="submitting_createTag" />
        <label>Tag name</label>
      </PIftaLabel>
      <PButton
        label="Create tag"
        type="submit"
        :loading="submitting_createTag"
        :disabled="submitting_createTag || !tagName.trim()"
      />
    </form>
  </PDialog>
</template>

<script setup lang="ts">
const tagName = ref<string>("");
const submitting_createTag = ref(false);
const mainStore = useMainStore();
const dialogsStore = useDialogsStore();
const createTag = async () => {
  submitting_createTag.value = true;
  try {
    await mainStore.createTag({ name: tagName.value });
    tagName.value = "";
    dialogsStore.createTag = false;
  } catch (error) {
    console.error(error);
  }
  submitting_createTag.value = false;
};
</script>
