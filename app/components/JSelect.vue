<template>
  <div class="j-select">
    <label v-if="label" :for="triggerId">{{ label }}</label>
    <div class="j-select__container" :class="{ 'j-select__container--invalid': invalid }">
      <div
        ref="rootRef"
        class="j-select__field"
        :class="{ 'j-select__field--open': isOpen, 'j-select__field--disabled': disabled }"
      >
        <button
          :id="triggerId"
          type="button"
          class="j-select__box"
          :disabled="disabled"
          :aria-expanded="isOpen"
          :aria-haspopup="'listbox'"
          :aria-controls="isOpen ? listboxId : undefined"
          @click="isOpen = !isOpen"
        >
          <span class="j-select__value" :class="{ 'j-select__value--placeholder': !hasValue }">
            {{ displayValue }}
          </span>
          <i class="j-select__icon" :class="PrimeIcons.CHEVRON_DOWN" />
        </button>
        <Transition name="j-select-overlay">
          <div v-if="isOpen" class="j-select__overlay">
            <ul :id="listboxId" role="listbox">
              <li
                v-for="(option, index) in options"
                :key="index"
                role="option"
                class="j-select__option line-clamp-1"
                :class="{ 'j-select__option--selected': modelValue === option }"
                :aria-selected="modelValue === option"
                @click="select(option)"
              >
                {{ optionLabel(option) }}
              </li>
            </ul>
          </div>
        </Transition>
      </div>
      <div v-if="message !== null" class="j-select__message line-clamp-1">
        {{ message || "&nbsp;" }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { PrimeIcons } from "@primevue/core/api";

const props = withDefaults(
  defineProps<{
    label?: string;
    invalid?: boolean;
    /**
     * - `null` hides the message block
     * @default null
     */
    message?: string | null;
    placeholder?: string;
    disabled?: boolean;
    options: readonly T[];
    optionLabel?: (option: T) => string;
  }>(),
  {
    label: undefined,
    message: null,
    placeholder: undefined,
    optionLabel: (option: T) => String(option),
  },
);

const modelValue = defineModel<T | undefined>();

const rootRef = useTemplateRef<HTMLElement>("rootRef");
const triggerId = useId();
const listboxId = `${triggerId}-listbox`;
const isOpen = ref(false);

const hasValue = computed(() => modelValue.value !== undefined && modelValue.value !== null);

const displayValue = computed(() => {
  if (!hasValue.value) return props.placeholder ?? "";
  return props.optionLabel(modelValue.value as Exclude<T, undefined | null>);
});

function close() {
  isOpen.value = false;
}
function select(option: T) {
  modelValue.value = option;
  close();
}
onClickOutside(rootRef, close);

// Escape
function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") close();
}
onMounted(() => document.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => document.removeEventListener("keydown", onKeydown));
</script>

<style scoped>
@reference "~/assets/css/main.css";
@layer components {
  .j-select {
    @apply flex-stack gap-2;
  }

  label {
    color: var(--p-form-field-float-label-color);
  }

  .j-select__container {
    @apply flex-stack gap-1;
  }

  .j-select__field {
    position: relative;
  }

  .j-select__box {
    @apply flex-stream rounded-2 w-full gap-4;
    background: var(--p-form-field-background);
    border: 1px solid var(--p-form-field-border-color);
    color: var(--p-form-field-color);
    transition-duration: var(--p-form-field-transition-duration);
    cursor: pointer;
    outline: none;
    padding: 8.5px 16px;
  }

  .j-select__box:hover {
    border-color: var(--p-form-field-hover-border-color);
  }

  .j-select__box:focus {
    border-color: var(--p-form-field-focus-border-color);
  }

  .j-select__value {
    flex: 1;
    min-width: 0;
    text-align: left;
  }

  .j-select__value.j-select__value--placeholder {
    color: var(--p-form-field-placeholder-color);
  }

  .j-select__icon {
    @apply shrink-0;
    color: var(--p-form-field-icon-color);
    transition: transform 0.2s ease;
  }

  .j-select__overlay {
    @apply rounded-2 absolute left-0 z-1 w-full shadow-md;
    background: var(--p-select-overlay-background);
    color: var(--p-select-overlay-color);
    border: 1px solid var(--p-select-overlay-border-color);
    top: calc(100% + 4px);
    overflow: hidden;
  }

  ul {
    @apply flex-stack p-1;
    gap: 2px;
    max-height: 200px;
    overflow-y: auto;
  }

  .j-select__option {
    @apply rounded-1 shrink-0;
    background: var(--p-select-option-background);
    color: var(--p-select-option-color);
    cursor: pointer;
    padding: 8px 16px;
    transition: background-color 0.2s ease;
  }

  .j-select__option:hover {
    background: var(--p-select-option-focus-background);
    color: var(--p-select-option-focus-color);
  }

  .j-select__option.j-select__option--selected {
    background: var(--p-select-option-selected-background);
    color: var(--p-select-option-selected-color);
  }
  .j-select__option.j-select__option--selected:hover {
    background: var(--p-select-option-selected-focus-background);
    color: var(--p-select-option-selected-focus-color);
  }

  .j-select__field.j-select__field--open > .j-select__box {
    border-color: var(--p-form-field-focus-border-color);
  }

  .j-select__field.j-select__field--disabled > .j-select__box {
    color: var(--p-form-field-disabled-color);
    cursor: default;
    opacity: 0.6;
  }

  .j-select__message {
    color: var(--p-text-muted-color);
    font-size: 12px;
    line-height: 16px;
  }

  .j-select__container.j-select__container--invalid > .j-select__field > .j-select__box {
    /* @apply border-red-500 text-red-500; */
    border-color: var(--p-form-field-invalid-border-color);
  }

  .j-select__container.j-select__container--invalid
    > .j-select__field
    > .j-select__box
    > .j-select__value--placeholder {
    color: var(--p-form-field-invalid-placeholder-color);
  }

  .j-select__container.j-select__container--invalid > .j-select__message {
    color: var(--p-form-field-float-label-invalid-color);
  }

  .j-select-overlay-enter-active,
  .j-select-overlay-leave-active {
    transition:
      opacity 0.15s ease,
      transform 0.15s ease;
  }

  .j-select-overlay-enter-from,
  .j-select-overlay-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }
}
</style>
