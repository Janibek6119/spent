<template>
  <PMenubar>
    <template #start>
      <PBreadcrumb :home="{ icon: PrimeIcons.HOME, route: '/' }" :model="breadcrumbs">
        <template #item="{ item }">
          <NuxtLink :to="item.route" class="font-semibold opacity-50">
            <i v-if="item.icon" :class="item.icon" />
            {{ item.label }}
          </NuxtLink>
        </template>
      </PBreadcrumb>
    </template>
    <template #end>
      <div class="flex gap-1">
        <PButton
          :icon="PrimeIcons.SAVE"
          outlined
          rounded
          severity="secondary"
          size="small"
          title="Export database"
          @click="mainStore.exportDb()"
        />
        <PButton
          :icon="PrimeIcons.FOLDER_OPEN"
          outlined
          rounded
          severity="secondary"
          size="small"
          title="Import database"
          @click="triggerImport"
        />
        <input ref="fileInput" type="file" accept=".json" hidden @change="onFileSelected" />
        <PButton
          :icon="PrimeIcons.CALCULATOR"
          outlined
          rounded
          severity="secondary"
          size="small"
          title="Tag statistics"
          @click="dialogsStore.tagStats = true"
        />
        <PButton
          :icon="layoutStore.darkMode ? PrimeIcons.MOON : PrimeIcons.SUN"
          outlined
          rounded
          severity="secondary"
          size="small"
          @click="layoutStore.darkMode = !layoutStore.darkMode"
        />
      </div>
    </template>
  </PMenubar>
</template>

<script setup lang="ts">
import { PrimeIcons } from "@primevue/core/api";
import { format } from "date-fns";
import type { MenuItem } from "primevue/menuitem";
const layoutStore = useLayoutStore();
const mainStore = useMainStore();
const dialogsStore = useDialogsStore();
const route = useRoute();

const fileInput = ref<HTMLInputElement>();
const triggerImport = () => fileInput.value?.click();
const onFileSelected = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  await mainStore.importDb(file);
  if (fileInput.value) fileInput.value.value = "";
};

type Breadcrumb = MenuItem & {
  route: string;
};
const breadcrumbs = computed<Breadcrumb[]>(() => {
  const result: Breadcrumb[] = [];
  if (!route.params.year) return result;
  result.push({
    label: `${route.params.year}`,
    route: `/year-${route.params.year}`,
  });
  if (!route.params.month) return result;
  result.push({
    label: format(new Date(Number(route.params.year), Number(route.params.month), 1), "MMMM"),
    route: `/year-${route.params.year}/month-${route.params.month}`,
  });
  if (!route.params.day) return result;
  result.push({
    label: `${route.params.day}`,
    route: `/year-${route.params.year}/month-${route.params.month}/day-${route.params.day}`,
  });
  return result;
});
</script>
