<script setup lang="ts">
import { showingHelpModal, showingSettingsModal } from "@/globalState";
import Modal from "@/components/Modal.vue";
import Article from "@/components/Article.vue";
import Settings from "@/components/Settings.vue";

function showHelpModal() {
  showingHelpModal.value = true;
}
function closeHelpModal() {
  showingHelpModal.value = false;
}

function showSettingsModal() {
  showingSettingsModal.value = true;
}
function closeSettingsModal() {
  showingSettingsModal.value = false;
}

const version = import.meta.env.PACKAGE_VERSION;
</script>

<template>
  <div class="flex flex-row items-center">
    <div class="flex flex-row gap-4 items-center">
      <h1>Polytwisters</h1>
      <h2 class="text-(--color-text-light)">v{{ version }}</h2>
    </div>
    <div class="flex-1 flex flex-row items-center justify-end gap-2">
      <button
        class="button cursor-pointer hidden md:flex flex-row items-center gap-1"
        @click="showSettingsModal"
      >
        <div class="material oldschool:hidden!">settings</div>
        <img class="theme-default:hidden" src="@/assets/icons/settings.png" />
        <div>Settings</div>
      </button>
      <Modal :show="showingSettingsModal" @close="closeSettingsModal">
        <Settings />
      </Modal>

      <button
        @click="showHelpModal"
        class="button cursor-pointer flex flex-row items-center gap-1"
      >
        <div class="material oldschool:hidden!">help</div>
        <img class="theme-default:hidden" src="@/assets/icons/help.png" />
        <div>What is this?</div>
      </button>
      <Modal :show="showingHelpModal" @close="closeHelpModal">
        <Article />
      </Modal>

      <a
        target="_blank"
        href="https://www.polytope.net/hedrondude/twisters.htm"
        class="hidden md:flex button flex-row items-center gap-2"
      >
        <div>Bowers' page</div>
        <div class="text-base! material oldschool:hidden!">open_in_new</div>
        <img class="theme-default:hidden" src="@/assets/icons/external.png" />
      </a>
      <a
        target="_blank"
        href="https://github.com/polytwisters/polytwisters.com/"
        class="hidden md:flex button flex-row items-center gap-2"
      >
        <div>Source code</div>
        <div class="text-base! material oldschool:hidden!">open_in_new</div>
        <img class="theme-default:hidden" src="@/assets/icons/external.png" />
      </a>
    </div>
  </div>
</template>
