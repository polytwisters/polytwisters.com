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
  It would be nice if I could create a full-size element and position the dialog box in the center
  using standard grid methods. That would work fine, but for accessibility I wanted to also use
  the <dialog> element, and there my troubles began.

  There are some serious weirdnesses with the layout in the top layer. I first tried setting the
  <dialog> element to full-screen so I could place the actual dialog box using grid. But thanks to a
  really subtle interaction between Tailwind and the default user-agent styles,
  "fixed top-0 left-0 w-screen h-screen" creates a 10rem gap to the right and bottom, which I spent
  many hours debugging. The solution would technically be "max-w-screen max-h-screen" to override a
  user-agent setting, but I decided to give up with that approach and just make the <dialog> and the
  dialog box the same. It was a bit of an XY problem anyway -- the <dialog> shouldn't contain the
  backdrop.

  So I can't use CSS grid to center the dialog box in the viewport. Instead I set the height to
  100vh - 10rem and the width between 100rem and 100vw - 10rem, and a standard "translate" trick is
  used for horizontal centering.
  -->
  <dialog
    ref="dialog"
    closedby="any"
    class="fixed top-10 h-[calc(100vh-5rem)] w-[50rem] max-w-[calc(100vw-5rem)] left-[50vw] -translate-x-1/2 backdrop:bg-transparent backdrop:backdrop-blur-sm bg-(--color-modal-bg) my-round text-white p-5 shadow-md oldschool:shadow-none"
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
