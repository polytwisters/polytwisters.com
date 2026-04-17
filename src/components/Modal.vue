<script setup lang="ts">
import Button from "./Button.vue";
import { useTemplateRef, watch } from "vue";

const dialog = useTemplateRef<HTMLDialogElement>("dialog");

const emit = defineEmits<{
  (e: "close"): void;
}>();

const { show } = defineProps<{ show: boolean }>();

// If show flips from false to true, show the modal.
watch(
  () => show,
  (newValue) => {
    if (newValue) {
      dialog.value?.showModal();
    } else {
      dialog.value?.close();
    }
  },
);

function close() {
  emit("close");
}
</script>

<template>
  <!--
  The -translate-x-1/2 -translate-y-1/2 bits center the dialog horizontally and vertically. We
  cannot use grid/flexbox here (believe me, I tried).
  -->
  <dialog
    ref="dialog"
    closedby="any"
    class="fixed max-h-[calc(100vh-5rem)] top-[50vh] -translate-y-1/2 w-[50rem] max-w-[calc(100vw-5rem)] left-[50vw] -translate-x-1/2 p-5 theme-default:backdrop:bg-transparent theme-default:backdrop:backdrop-blur-sm bg-(--color-modal-bg) my-round my-shadow"
    @close="close"
  >
    <div class="absolute top-0 right-0">
      <Button icon="close" @click="close()" />
    </div>
    <div class="w-full h-full overflow-y-auto">
      <slot />
    </div>
  </dialog>
</template>
