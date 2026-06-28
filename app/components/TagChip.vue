<template>
  <PButton
    class="px-2 py-1"
    size="small"
    :label="tag.name"
    :outlined="!selected"
    severity="contrast"
    @contextmenu="$emit('contextmenu', $event)"
  />
</template>

<script setup lang="ts">
defineProps<{ tag: Tag; selected?: boolean }>();
defineEmits<{
  (e: "contextmenu", event: MouseEvent): void;
}>();
</script>
