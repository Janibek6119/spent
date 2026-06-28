<template>
  <NuxtLink
    class="hover:bg-surface-500/20 active:bg-surface-500/20 border-surface-500 grid cursor-pointer grid-cols-2
      justify-between gap-2 border-b py-0 duration-200"
    :to="to"
  >
    <span class="flex-stream gap-2">
      <i v-if="icon" :class="[icon, pt?.['icon-class']]" />
      <div v-else class="w-1" />
      <slot name="label">
        <span :class="pt?.['label-class']">{{ label }}</span>
      </slot>
    </span>
    <div class="truncate text-right font-mono">
      <slot name="amount" :class="pt?.['amount-class']">{{ amount?.toFixed(2) }}</slot>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string;
  label?: string;
  amount?: number;
  pt?: {
    "icon-class"?: string;
    "label-class"?: string;
    "amount-class"?: string;
  };
  to?: string;
}>();
</script>
