<template>
  <div class="flex-stack items-center gap-4">
    <h1>About</h1>
    <JHoldButton :loading="running" @click="onClickRun" />
    <JButton :icon="PrimeIcons.PLAY" :loading="running" @click="onClickRun" />
    <PButton severity="info" :label="`Click me x${count}`" :disabled="loading" @click="count++" />
    <PButton severity="success" label="Submit" :disabled="loading || !count" :loading="loading" @click="onSubmitFake" />
    <JButton label="Home" to="/" />
    <JInput v-model="username" class="w-60" label="Username" placeholder="Enter your username" />
    <JInput v-model="password" class="w-60" label="Password" placeholder="Enter your password" type="password" />
  </div>
</template>

<script setup lang="ts">
import { PrimeIcons } from "@primevue/core/api";

const count = ref(0);
const loading = ref(false);
const toast = useToast();

const username = ref("");
const password = ref("");

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

const running = ref(false);
const onClickRun = async () => {
  running.value = true;
  await new Promise((resolve) => setTimeout(resolve, 2000));
  running.value = false;
};
</script>
