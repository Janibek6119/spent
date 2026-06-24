<template>
  <div class="flex-stack items-center gap-4">
    <PButton severity="secondary" @click="toggleDarkMode">Toggle Dark Mode: {{ layoutStore.darkMode }}</PButton>
    <JTable :columns="cols" :rows="CURRENCIES" striped />
    <JSelect v-model="currency" class="w-30" :options="CURRENCIES" :option-label="(o) => o.value" />
    <JButton label="About" to="/about" />
  </div>
</template>

<script setup lang="ts">
const layoutStore = useLayoutStore();
const toggleDarkMode = () => {
  layoutStore.darkMode = !layoutStore.darkMode;
};

const CURRENCIES = ref([
  { label: "United States Dollar", value: "USD" },
  { label: "Euro", value: "EUR" },
  { label: "Japanese Yen", value: "JPY" },
  { label: "British Pound", value: "GBP" },
  { label: "Australian Dollar", value: "AUD" },
  { label: "Canadian Dollar", value: "CAD" },
  { label: "Swiss Franc", value: "CHF" },
  { label: "Chinese Yuan", value: "CNY" },
  { label: "Swedish Krona", value: "SEK" },
  { label: "New Zealand Dollar", value: "NZD" },
]);
const cols = defineTableColumns([
  { key: "label", header: "Name" },
  { key: "value", header: "Ticker" },
]);
const currency = ref(CURRENCIES.value[0]);
</script>
