<script setup lang="ts">
import { ref, watch } from "vue";
import * as globalState from "@/globalState";
import { Theme } from "@/globalState";

import MainViewer from "@/components/MainViewer.vue";
import PolytwisterTable from "@/components/PolytwisterTable.vue";
import WSlider from "@/components/WSlider.vue";
import TopBar from "@/components/TopBar.vue";
import MainViewerControls from "@/components/MainViewerControls.vue";
import TwisterCrossSections from "@/components/TwisterCrossSections.vue";
import InfoBox from "@/components/InfoBox.vue";

watch(
  globalState.theme,
  (newValue) => {
    if (newValue === Theme.Oldschool) {
      document.body.classList.remove("theme-default");
      document.body.classList.add("oldschool");
    } else {
      document.body.classList.remove("oldschool");
      document.body.classList.add("theme-default");
    }
  },
  { immediate: true },
);

const crossSectionW = globalState.crossSectionW;

enum Tab {
  Navigation,
  Twisters,
}

const tab = ref(Tab.Navigation);

function setTab(newTab: Tab) {
  tab.value = newTab;
}

const expandedView = globalState.expandedView;
</script>

<template>
  <div
    class="w-screen h-screen grid grid-rows-[min-content_minmax(0,1fr)] panel"
    v-if="expandedView"
  >
    <MainViewerControls />
    <MainViewer />
    <WSlider v-model="crossSectionW" />
  </div>
  <div
    class="w-screen h-screen grid grid-cols-1 grid-rows-[min-content_min-content_minmax(0,1fr)] md:grid-cols-2 md:grid-rows-[min-content_minmax(0,1fr)]"
    v-else
  >
    <div class="panel md:col-span-2 oldschool:bg-(--color-active)">
      <TopBar />
    </div>

    <div class="panel md:order-3 grid grid-rows-[min-content_minmax(0,1fr)]">
      <InfoBox />
      <div
        class="hidden md:grid grid-rows-[min-content_minmax(0,1fr)] relative"
      >
        <nav>
          <ul class="flex flex-row">
            <li
              :class="{ active: tab === Tab.Navigation }"
              @click="setTab(Tab.Navigation)"
            >
              Navigation
            </li>
            <li
              :class="{ active: tab === Tab.Twisters }"
              @click="setTab(Tab.Twisters)"
            >
              Twisters
            </li>
          </ul>
        </nav>
        <TwisterCrossSections v-if="tab === Tab.Twisters" />
        <PolytwisterTable v-if="tab === Tab.Navigation" />
      </div>
    </div>

    <div
      class="panel md:row-span-2 grid grid-cols-1 grid-rows-[min-content_minmax(0,1fr)_min-content]"
    >
      <MainViewerControls />
      <MainViewer />
      <WSlider v-model="crossSectionW" />
    </div>
  </div>
</template>
