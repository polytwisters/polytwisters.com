<script setup lang="ts">
import { useTemplateRef, watch } from 'vue';
import * as globalState from "@/globalState";

const dialog = useTemplateRef<HTMLDialogElement>("dialog");

const showingHelpModal = globalState.showingHelpModal;

// If showingHelpModal flips from false to true, show the modal.
watch(showingHelpModal, (newValue) => {
  if (newValue) {
    dialog.value?.showModal();
  }
});

// When the modal closes, update the showingHelpModal ref to reflect this.
function onClose() {
  showingHelpModal.value = false;
}
</script>

<template>
  <!--
  For best accessibility, I use the HTML <dialog> element, and place the backdrop using a Teleport.
  There are some serious weirdnesses with the layout in the top layer. In particular, I wanted
  control over the layout, so I first tried setting the <dialog> element to full-screen so I could
  place the actual dialog box using grid. But thanks to a bizarre subtle interaction between
  Tailwind and the default user-agent styles, "fixed top-0 left-0 w-screen h-screen" creates a gap
  to the right and bottom, which I spent many hours debugging. The solution would technically be
  "max-w-screen max-h-screen" to override a user-agent setting, but I decided to give up with that
  approach and just make the <dialog> and the dialog box the same.

  Here the height is 100vh - 10rem and the width is between 50rem and 100vw - 10rem, and a standard
  "translate" trick is used for horizontal centering.
  -->
  <dialog
    ref="dialog"
    closedby="any"
    class="fixed top-10 h-[calc(100vh-5rem)] w-min-[50rem] w-max-[calc(100vw-10rem)] left-[50vw] -translate-x-1/2
    backdrop:bg-transparent backdrop:backdrop-blur-sm
    bg-primary rounded-sm text-white p-5 shadow-md"
    @close="onClose">
    <div class="w-full h-full overflow-y-auto">
      <slot />
    </div>
  </dialog>
</template>