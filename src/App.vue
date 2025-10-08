<script setup lang="ts">
import { ref } from "vue";
import * as _ from "lodash";

import * as globalState from "@/globalState";
import * as camera from "@/camera";
import * as cameraControls from "@/cameraControls";

import MainViewer from "@/components/MainViewer.vue";
import Button from "@/components/Button.vue";
import WSlider from "@/WSlider.vue";
import TopBar from "./components/TopBar.vue";
import TwisterCrossSections from "./TwisterCrossSections.vue";

const polytwisterDef = globalState.polytwisterDef;
const crossSectionW = globalState.crossSectionW;
const takeScreenshot = globalState.takeScreenshot;

////////////////////////////////////////////////////////////////////////////////////////////////////
// UI

const fullscreen = ref(false);
function toggleFullscreen() {
  fullscreen.value = !fullscreen.value;
}

function openHelp() {
  fullscreen.value = false;
  setTimeout(() => {
    document.getElementById("article")?.scrollIntoView();
  }, 10);
}

const devMode = import.meta.env.DEV;
const experimentalMode = ref(false);

const canvasHeights = [240, 360, 480, 720, 1080, 2160];

const canvasSize = globalState.canvasSize;
</script>

<template>
  <div class="flex flex-col items-center text-slate-100">
    <div class="flex flex-col gap-2 max-w-300">
      <TopBar />

      <!-- fullscreen container -->
      <div
        :class="[
          'flex',
          'flex-col',
          'gap-2',
          ...(fullscreen
            ? [
                'fixed',
                'left-0',
                'top-0',
                'z-10',
                'bg-black',
                'w-screen',
                'h-screen',
                'p-3',
              ]
            : []),
        ]"
      >
        <!-- info: name, basic navigation, settings, fullscreen -->

        <div class="toolbar flex flex-row items-center">
          <div class="flex-1 flex flex-row items-baseline gap-2">
            <div v-if="polytwisterDef.index !== undefined">
              {{ polytwisterDef.index }}.
            </div>
            <h2
              :class="[
                'font-bold',
                'text-xl',
                polytwisterDef.name.length > 30 ? 'tracking-tight' : '',
              ]"
            >
              {{ polytwisterDef.name }}
            </h2>
            <div :class="[polytwisterDef.name.length > 40 ? 'text-sm' : '']">
              ({{ polytwisterDef.acronym }})
            </div>
          </div>
          <div class="flex flex-row justify-end gap-2">
            <Button
              @click="globalState.previous"
              material
              icon="chevron_left"
              help="Previous"
            />
            <Button
              @click="globalState.next"
              material
              icon="chevron_right"
              help="Next"
            />
            <Button
              @click="globalState.random"
              material
              icon="casino"
              help="Random"
            />
            <Button @click="openHelp" material icon="help" help="About" />
            <Button
              material
              :icon="fullscreen ? 'fullscreen_exit' : 'fullscreen'"
              help="Fullscreen"
              @click="toggleFullscreen"
            />
          </div>
        </div>

        <!-- Bar 3: View controls. -->

        <div class="toolbar flex flex-row">
          <div class="flex flex-row gap-2 flex-1">
            <Button
              @click="camera.reset"
              material
              icon="home"
              help="Reset camera"
            />
            <Button
              @click="cameraControls.zoomIn"
              material
              icon="add"
              help="Zoom in"
            />
            <div
              class="size-8 py-1 -mx-1 text-center material text-gray-200 select-none"
            >
              search
            </div>
            <Button
              @click="cameraControls.zoomOut"
              material
              icon="remove"
              help="Zoom out"
            />
          </div>
          <div class="flex-1 flex flex-row justify-end gap-2">
            <select v-model="canvasSize" class="button text-center">
              <option v-for="height in canvasHeights" :value="height">
                {{ height }}px
              </option>
            </select>
            <Button
              @click="takeScreenshot"
              material
              icon="photo_camera"
              help="Take screenshot"
            />
          </div>
        </div>

        <MainViewer />

        <TwisterCrossSections v-if="experimentalMode" />

        <div
          :class="fullscreen ? ['absolute', 'bottom-0', 'w-full', 'p-8'] : []"
        >
          <WSlider v-model="crossSectionW" />
        </div>
      </div>
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
</style>
