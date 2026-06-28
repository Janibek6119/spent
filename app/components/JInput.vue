<template>
  <div class="j-input" :class="{ 'j-input--invalid': invalid }">
    <label v-if="label" :for="inputId" class="j-input__label" :class="ptClass?.label">{{ label }}</label>
    <div
      class="j-input__box"
      :class="[ptClass?.box, { 'j-input__box--actions': $slots.actions || showPasswordToggle }]"
    >
      <slot name="input-field" />
      <input
        :id="inputId"
        ref="inputRef"
        class="j-input__input"
        :class="ptClass?.input"
        :value="modelValue"
        :type="resolvedType"
        :placeholder="placeholder"
        :disabled="disabled"
        @beforeinput="sabotageInvalidInput"
        @input="acceptOrRevert"
        @compositionend="acceptOrRevert"
        @blur="onBlur"
      />
      <div v-if="$slots.actions || showPasswordToggle" class="j-input__actions" :class="ptClass?.actions">
        <slot
          name="actions"
          :disabled="disabled"
          :revealed="passwordRevealed"
          @toggle-revealed="passwordRevealed = !passwordRevealed"
        />
        <JButton
          v-if="showPasswordToggle"
          class="j-input__toggle touch-none"
          :theme="null"
          :class="ptClass?.toggle"
          symmetric
          :aria-label="passwordRevealed ? $t('common.hidePassword') : $t('common.showPassword')"
          :title="passwordRevealed ? $t('common.hidePassword') : $t('common.showPassword')"
          :disabled="disabled"
          :icon="passwordRevealed ? PrimeIcons.EYE_SLASH : PrimeIcons.EYE"
          @pointerdown.prevent
          @click="togglePasswordRevealed"
        />
      </div>
    </div>
    <div v-if="message !== null" class="j-input__message" :class="ptClass?.message">
      {{ message || "&nbsp;" }}
    </div>
  </div>
</template>

<script setup lang="ts">
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
    filter?: RegExp;
    placeholder?: string;
    type?: "text" | "password";
    /**
     * Show the reveal (eye) toggle for password fields.
     * @default true
     */
    showPasswordToggle?: boolean;
    disabled?: boolean;
    ptClass?: Partial<{
      label: string;
      box: string;
      input: string;
      actions: string;
      toggle: string;
      message: string;
    }>;
    preTransformer?: (value: string) => string;
    postTransformer?: (value: string) => string;
    blurTransformer?: (value: string) => string;
  }>(),
  {
    label: undefined,
    message: null,
    filter: undefined,
    placeholder: undefined,
    type: "text",
    showPasswordToggle: true,
    ptClass: undefined,
    preTransformer: (v: string) => v,
    postTransformer: (v: string) => v,
    blurTransformer: (v: string) => v,
  },
);

const emit = defineEmits(["blur"]);
const inputId = useId();
const modelValue = defineModel<string>({ required: true });
const inputRef = useTemplateRef<HTMLInputElement>("inputRef");
const passwordRevealed = ref(false);
const showPasswordToggle = computed(() => props.type === "password" && props.showPasswordToggle);
const resolvedType = computed(() => {
  if (props.type === "password") return passwordRevealed.value ? "text" : "password";
  return props.type;
});
/**
 * Just because of Chromium.
 *
 * Chromium clears the input's selection/caret when `type` attr flips to/from `password`.
 * So we must restore the selection TWICE:
 * 1. AFTER Vue has patched the attribute (nextTick)
 * 2. AFTER the browser's own reset settles (requestAnimationFrame)
 *
 * doing it any earlier is overwritten by chromium's own reset
 */
function togglePasswordRevealed() {
  passwordRevealed.value = !passwordRevealed.value;
  const el = inputRef.value;
  if (!el) return console.warn("INPUT_REF_NOT_FOUND");
  const start = el.selectionStart ?? null;
  if (start === null) return console.warn("INPUT_SELECTION_START_NOT_FOUND");
  const end = el.selectionEnd ?? null;
  if (end === null) return console.warn("INPUT_SELECTION_END_NOT_FOUND");
  const dir = el.selectionDirection ?? undefined;
  const restore = () => {
    if (document.activeElement !== el) el.focus();
    el.setSelectionRange(start, end, dir);
  };
  nextTick(() => {
    restore(); // After Vue has patched the attribute
    requestAnimationFrame(restore); // After the chromium reset
  });
}

const resolvedFilter = computed(() => {
  if (!props.filter) return null;
  const flags = props.filter.flags.replace(/[gy]/g, "");
  return new RegExp(props.filter.source, flags);
});
const lastValidInput = ref(modelValue.value);
function isValidInput(value: string): boolean {
  return !resolvedFilter.value || resolvedFilter.value.test(value);
}
watch(modelValue, (value) => {
  if (isValidInput(value)) lastValidInput.value = value;
});

/** Put into the <input> AND into the vars */
function commit(el: HTMLInputElement, value: string) {
  if (value !== el.value) {
    const caret = el.selectionStart ?? value.length;
    el.value = value;
    const pos = Math.max(0, Math.min(caret, value.length));
    el.setSelectionRange(pos, pos);
  }
  lastValidInput.value = value;
  modelValue.value = value;
}

/** Predict input.value before it lands - if bad, prevent it from happening */
function sabotageInvalidInput(event: InputEvent) {
  if (!resolvedFilter.value) return;
  if (event.inputType !== "insertText" && event.inputType !== "insertFromPaste") return;
  const insertedData = event.data;
  if (typeof insertedData !== "string") return console.warn("insertedData is not a string", insertedData);

  const _el = event.target as HTMLInputElement;
  const start = _el.selectionStart ?? _el.value.length;
  const end = _el.selectionEnd ?? _el.value.length;
  const predictedNewValue = _el.value.slice(0, start) + insertedData + _el.value.slice(end);

  // Yes, only validate, not transform. transform in the @input handler.
  if (!isValidInput(props.preTransformer(predictedNewValue))) event.preventDefault();
}

function acceptOrRevert(event: InputEvent | CompositionEvent) {
  if ("isComposing" in event && event.isComposing) return; // Don't interfere with IME composition ongoing
  const el = event.target as HTMLInputElement;
  const candidate = props.preTransformer(el.value);
  if (isValidInput(candidate)) {
    commit(el, props.postTransformer(candidate));
  } else {
    const delta = el.value.length - lastValidInput.value.length;
    const caret = (el.selectionStart ?? el.value.length) - delta;
    el.value = lastValidInput.value;
    const pos = Math.max(0, Math.min(caret, lastValidInput.value.length));
    el.setSelectionRange(pos, pos);
    modelValue.value = lastValidInput.value;
  }
}

function onBlur() {
  const el = inputRef.value;
  if (el) commit(el, props.blurTransformer(el.value));
  emit("blur");
}
</script>

<style scoped>
@reference "~/assets/css/main.css";
@layer components {
  .j-input {
    @apply flex-stack;
  }

  .j-input__label {
    @apply mb-2 truncate;
    color: var(--p-form-field-float-label-color);
  }

  .j-input__box {
    @apply flex-center rounded-2 overflow-hidden;
    transition-duration: var(--p-form-field-transition-duration);
    border: 1px solid var(--p-form-field-border-color);
    background: var(--p-form-field-background);
  }
  .j-input__box:hover {
    border-color: var(--p-form-field-hover-border-color);
  }
  .j-input__box:focus-within {
    border-color: var(--p-form-field-focus-border-color);
  }

  .j-input__input {
    @apply grow;
    background: var(--p-form-field-background);
    color: currentColor;
    caret-color: var(--p-form-field-color);
    min-width: 0;
    outline: none;
    padding: 8.5px 16px;
  }
  .j-input__input::placeholder {
    color: var(--p-form-field-placeholder-color);
  }
  .j-input__box.j-input__box--actions > .j-input__input {
    @apply pr-0;
  }

  .j-input__actions {
    @apply flex-stream gap-1 pl-2;
  }

  .j-input__toggle {
    @apply size-9.5;
    color: var(--p-form-field-icon-color);
  }

  .j-input__message {
    @apply mt-1 truncate text-xs;
    color: var(--p-text-muted-color);
  }

  .j-input.j-input--invalid > .j-input__box {
    border-color: var(--p-form-field-invalid-border-color);
  }

  .j-input.j-input--invalid > .j-input__box > .j-input__input {
    color: var(--p-form-field-invalid-color);
  }

  .j-input.j-input--invalid > .j-input__box > .j-input__input::placeholder {
    color: var(--p-form-field-invalid-placeholder-color);
  }

  .j-input.j-input--invalid > .j-input__message {
    color: var(--p-form-field-invalid-color);
  }
}
</style>
