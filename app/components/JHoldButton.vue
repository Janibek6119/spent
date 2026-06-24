<template>
  <JButton
    v-tooltip.top="trulyDisabled ? null : tooltip"
    v-bind="{ ...$props, ...$attrs }"
    :symmetric="!label"
    @touchstart.prevent
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointerleave="onPointerLeave"
  >
    <span class="flex-center size-4.5">
      <i v-if="loading" :class="PrimeIcons.SPINNER" class="size-4 animate-spin" />
      <template v-else-if="icon">
        <i v-if="holding === null" :class="icon" />
        <svg
          v-else-if="typeof holding === 'number'"
          class="j-completion-circle"
          viewBox="0 0 36 36"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle class="j-completion-circle__track" cx="18" cy="18" r="15" fill="none" />
          <circle class="j-completion-circle__arc" cx="18" cy="18" r="15" fill="none" />
        </svg>
      </template>
      <template v-else>
        <svg
          v-if="holding === null || typeof holding === 'number'"
          class="j-completion-circle"
          viewBox="0 0 36 36"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle class="j-completion-circle__track" cx="18" cy="18" r="15" fill="none" />
          <circle
            v-if="typeof holding === 'number'"
            class="j-completion-circle__arc"
            cx="18"
            cy="18"
            r="15"
            fill="none"
          />
        </svg>
      </template>
      <i v-if="holding === 'done'" :class="PrimeIcons.CHECK_CIRCLE" />
    </span>
    <span v-if="label" class="j-button__label">{{ label }}</span>
  </JButton>
</template>

<script setup lang="ts">
import { PrimeIcons } from "@primevue/core/api";
import type { JButtonTheme } from "~/components/JButton.vue";

const emit = defineEmits<{
  (e: "click"): void;
}>();

const props = defineProps<{
  label?: string;
  loading?: boolean;
  disabled?: boolean;
  theme?: JButtonTheme;
  iconPos?: "left" | "right";
  type?: "submit" | "reset" | "button";
  icon?: (typeof PrimeIcons)[keyof typeof PrimeIcons];
}>();

const trulyDisabled = computed(() => props.disabled || props.loading);
watch(trulyDisabled, (nowDisabled) => {
  if (nowDisabled) interruptHold();
});

type HoldState = number | null | "done";
const holding = ref(null as HoldState);
const tooltip = computed(() => (holding.value === null ? "Hold" : null));

const onPointerDown = () => {
  if (trulyDisabled.value) return;
  const triggeredAt = Date.now();
  holding.value = triggeredAt;
  setTimeout(() => {
    if (triggeredAt === holding.value) {
      holding.value = "done";
      emit("click");
    }
  }, 1000);
};

const onPointerUp = () => {
  if (trulyDisabled.value) return;
  interruptHold();
};

const interruptHold = () => {
  if (typeof holding.value === "number") holding.value = null;
};
const flushHold = () => {
  if (holding.value === "done") holding.value = null;
};

const onPointerLeave = () => {
  if (trulyDisabled.value) return;
  interruptHold();
  flushHold();
};
watch(props, () => {
  flushHold();
});
</script>

<style scoped>
@reference "~/assets/css/main.css";
.j-completion-circle {
  @apply size-4.5 shrink-0;
}

.j-completion-circle__track {
  stroke: currentColor;
  stroke-width: 3;
  stroke-dasharray: 3 3.2;
  opacity: 0.8;
  transition: 0.2s;
}

button:hover:not(:disabled) .j-completion-circle__track {
  opacity: 1;
}

.j-completion-circle__arc {
  stroke: currentColor;
  stroke-width: 3;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: center;
  stroke-dasharray: 94.248 94.248;
  stroke-dashoffset: 94.248;
  animation: completion-ring 1s linear forwards;
}

@keyframes completion-ring {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
