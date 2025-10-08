<script setup lang="ts">
import { ref } from "vue";
import * as globalState from "@/globalState";

import MainViewer from "@/components/MainViewer.vue";
import PolytwisterTable from "@/PolytwisterTable.vue";
import WSlider from "@/WSlider.vue";
import TopBar from "@/components/TopBar.vue";
import MainViewerControls from "@/components/MainViewerControls.vue";
import TwisterCrossSections from "./TwisterCrossSections.vue";
import InfoBox from "./components/InfoBox.vue";

const crossSectionW = globalState.crossSectionW;

enum Tab {
  Navigation,
  Twisters,
}

const tab = ref(Tab.Navigation);

function setTab(newTab: Tab) {
  tab.value = newTab;
}
</script>

<template>
  <div class="
  w-screen h-screen text-slate-100
  gap-4
  grid grid-cols-2 grid-rows-[min-content_min-content_auto]
  ">
    <div class="col-span-full">
      <TopBar />
    </div>
    <div class="row-span-2 grid grid-cols-1 grid-rows-[min-content_auto_min-content]">
      <MainViewerControls />
      <MainViewer />
      <WSlider v-model="crossSectionW" />
    </div>
    <InfoBox />
    <div class="grid grid-rows-[min-content_auto]">
      <nav>
        <ul class="flex flex-row">
          <li :class="{ active: tab === Tab.Navigation }" @click="setTab(Tab.Navigation)">Navigation</li>
          <li :class="{ active: tab === Tab.Twisters }"  @click="setTab(Tab.Twisters)">Twisters</li>
        </ul>
      </nav>
      <TwisterCrossSections v-if="tab === Tab.Twisters" />
      <PolytwisterTable v-if="tab === Tab.Navigation" />
    </div>
  </div>
</template>

<style>
@import "./style.css";

body {
  background-color: black;
}

input[type="range"] {
  -webkit-appearance: none;
  background: transparent;
}

input[type="range"]::-moz-range-track {
  @apply bg-primary h-2 rounded-full;
}

input[type="range"]::-webkit-slider-runnable-track {
  @apply bg-primary h-2 rounded-full;
}

input[type="range"]::-moz-range-thumb {
  @apply bg-gray-200 size-4 rounded-full border-none cursor-pointer;
}

input[type="range"]::-webkit-slider-thumb {
  @apply bg-gray-200 size-4 rounded-full border-none cursor-pointer -mt-1;
  -webkit-appearance: none;
}

input[type="number"] {
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.toolbar {
  @apply z-20;
}

nav li {
  @apply py-2 px-3 bg-primary;
}

nav li.active {
  @apply py-2 px-3 bg-active;
}
</style>
