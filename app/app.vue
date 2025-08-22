<template>
  <div class="flex min-h-screen flex-col">
    <BigHello class="flex-center" />
    <PButton
      class="mx-auto mt-8 w-fit"
      severity="info"
      :label="`Click me x${count}`"
      :disabled="loading"
      @click="count++"
    />
    <PToast />
    <PButton
      class="mx-auto mt-8 w-fit"
      severity="success"
      label="Submit"
      :disabled="loading || !count"
      :loading="loading"
      @click="onSubmitFake"
    />
  </div>
</template>

<script setup lang="ts">
const count = ref(0);
const loading = ref(false);
const toast = useToast();

const onSubmitFake = () => {
  loading.value = true;
  const currentCount = count.value;
  setTimeout(() => {
    loading.value = false;
    toast.add({
      severity: "success",
      summary: "Success",
      detail: `Data submitted successfully: ${currentCount}`,
      life: 3000,
    });
    count.value = 0;
  }, 1000);
};
</script>
