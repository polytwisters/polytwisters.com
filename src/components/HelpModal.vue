<script setup lang="ts">
import { useTemplateRef, watch } from 'vue';
import * as globalState from "@/globalState";

const dialog = useTemplateRef<HTMLDialogElement>("dialog");

const showingHelpModal = globalState.showingHelpModal;

watch(showingHelpModal, (newValue) => {
  if (newValue) {
    dialog.value?.showModal();
  }
});

function onClose() {
  console.log("close by user");
  showingHelpModal.value = false;
}

function close() {
  console.log("close by code");
  dialog.value?.close();
  showingHelpModal.value = false;
}
</script>

<template>
  <dialog
    ref="dialog"
    closedby="any"
    class="fixed top-0 left-0 m-0 p-10 inset-0 w-screen h-screen bg-transparent"
    @close="onClose"
    @click.self="close">
    <div class="w-full h-full grid place-items-center">
      <div class="relative m-0 p-5 bg-primary rounded-sm text-white max-w-190">
        <slot />
      </div>
    </div>
  </dialog>
</template>