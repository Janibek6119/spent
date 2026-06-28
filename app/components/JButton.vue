<template>
  <NuxtLink
    v-if="to"
    class="j-button"
    :class="{
      'j-button--default': theme === 'default',
      'j-button--default-outlined': theme === 'default-outlined',
      'j-button--warn': theme === 'warn',
      'j-button--warn-outlined': theme === 'warn-outlined',
      'j-button--reversed': iconPos === 'right',
      'j-button--disabled': disabled || (VISIBLY_DISABLED_WHEN_LOADING && loading),
      'j-button--loading': loading,
      'j-button--rounded': rounded,
      'j-button--symmetric': symmetric ?? (!label && !$slots.default),
    }"
    :disabled="disabled || (VISIBLY_DISABLED_WHEN_LOADING && loading)"
    :loading="loading"
    :to="disabled || loading ? undefined : to"
  >
    <slot>
      <i v-if="loading" :class="PrimeIcons.SPINNER" class="j-button__icon size-4 animate-spin" />
      <i v-else-if="icon" class="j-button__icon size-4" :class="icon" />
      <span v-if="label" class="j-button__label">{{ label }}</span>
    </slot>
  </NuxtLink>
  <button
    v-else
    class="j-button"
    :class="{
      'j-button--default': theme === 'default',
      'j-button--default-outlined': theme === 'default-outlined',
      'j-button--warn': theme === 'warn',
      'j-button--warn-outlined': theme === 'warn-outlined',
      'j-button--reversed': iconPos === 'right',
      'j-button--disabled': disabled || (VISIBLY_DISABLED_WHEN_LOADING && loading),
      'j-button--loading': loading,
      'j-button--rounded': rounded,
      'j-button--symmetric': symmetric ?? (!label && !$slots.default),
    }"
    :disabled="disabled || (VISIBLY_DISABLED_WHEN_LOADING && loading)"
    :loading="loading"
    :type="type"
    @click="onClick"
  >
    <slot>
      <i v-if="loading" :class="PrimeIcons.SPINNER" class="j-button__icon size-4 animate-spin" />
      <i v-else-if="icon" class="j-button__icon size-4" :class="icon" />
      <span v-if="label" class="j-button__label">{{ label }}</span>
    </slot>
  </button>
</template>

<script setup lang="ts">
import { PrimeIcons } from "@primevue/core/api";
const VISIBLY_DISABLED_WHEN_LOADING = false;
export type JButtonProps = {
  label?: string;
  icon?: (typeof PrimeIcons)[keyof typeof PrimeIcons];
  disabled?: boolean;
  theme?: null | "default" | "default-outlined" | "warn" | "warn-outlined";
  to?: string;
  iconPos?: "left" | "right";
  type?: "submit" | "reset" | "button";
  loading?: boolean;
  /**
   * @default true // IF NO LABEL PRESENT
   */
  symmetric?: boolean;
  rounded?: boolean;
};
const props = withDefaults(defineProps<JButtonProps>(), {
  label: undefined,
  icon: undefined,
  theme: "default",
  to: undefined,
  iconPos: "left",
  type: "button",
  symmetric: undefined, // keep it, otherwise it becomes `false`
});

const emit = defineEmits<{
  (e: "click", event: PointerEvent): void;
}>();

const onClick = (e: PointerEvent) => {
  if (props.disabled || props.loading) return;
  emit("click", e);
};
</script>

<style>
@reference "~/assets/css/main.css";
:root {
  --j-button-tint: black;
}
.dark {
  --j-button-tint: white;
}
@layer components {
  .j-button {
    @apply flex-center rounded-2 touch-none items-center gap-2 select-none;
    padding: 8px 12px;
    font-weight: 600;
    transition: all 0.2s ease-in-out;
  }
  .j-button.j-button--disabled {
    cursor: default;
    opacity: 0.4;
    pointer-events: none;
  }
  .j-button.j-button--loading {
    cursor: progress;
  }
  .j-button.j-button--reversed {
    flex-direction: row-reverse;
  }
  .j-button.j-button--rounded {
    border-radius: 9999px;
  }
  .j-button.j-button--symmetric {
    padding: 8px;
    aspect-ratio: 1/1;
  }
  .j-button.j-button--default {
    @apply bg-danger text-white;
  }
  .j-button.j-button--default:not(.j-button--loading):hover {
    background-color: color-mix(in srgb, var(--color-danger), var(--j-button-tint) 15%);
  }
  .j-button.j-button--default:not(.j-button--loading):active {
    background-color: color-mix(in srgb, var(--color-danger), var(--j-button-tint) 30%);
  }
  .j-button.j-button--default-outlined {
    @apply text-danger border-danger/30 dark:border-danger/70 border bg-transparent;
  }
  .j-button.j-button--default-outlined:not(.j-button--loading):hover {
    @apply bg-danger/10;
  }
  .j-button.j-button--default-outlined:not(.j-button--loading):active {
    @apply bg-danger/20;
  }

  .j-button.j-button--warn {
    @apply bg-warn text-white;
  }
  .j-button.j-button--warn:not(.j-button--loading):hover {
    background-color: color-mix(in srgb, var(--color-warn), var(--j-button-tint) 15%);
  }
  .j-button.j-button--warn:not(.j-button--loading):active {
    background-color: color-mix(in srgb, var(--color-warn), var(--j-button-tint) 30%);
  }
  .j-button.j-button--warn-outlined {
    @apply text-warn border-warn/30 dark:border-warn/70 border bg-transparent;
  }
  .j-button.j-button--warn-outlined:not(.j-button--loading):hover {
    @apply bg-warn/10;
  }
  .j-button.j-button--warn-outlined:not(.j-button--loading):active {
    @apply bg-warn/20;
  }
}
</style>
