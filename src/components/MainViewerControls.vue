<script setup lang="ts">
import * as globalState from "@/globalState";
import * as camera from "@/camera";
import * as cameraControls from "@/cameraControls";
import Button from "@/components/Button.vue";
import SmallNavigation from "./SmallNavigation.vue";

const takeScreenshot = globalState.takeScreenshot;
const canvasSize = globalState.canvasSize;

const canvasHeights = [240, 360, 480, 720, 1080, 2160];

const expandedView = globalState.expandedView;
const expandView = globalState.expandView;
const exitExpandedView = globalState.exitExpandedView;
</script>

<template>
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
    <div v-if="expandedView" class="flex flex-row gap-2 flex-1 justify-center">
      <h1 class="text-center text-xl!">{{ globalState.polytwisterDef.value.name }}</h1>
    </div>
    <div class="flex-1 flex flex-row justify-end gap-2">
      <SmallNavigation v-if="expandedView" />
      <select v-model="canvasSize" class="button text-center">
        <option v-for="height in canvasHeights" :value="height">
          {{ height }}px
        </option>
      </select>
      <Button
        @click="takeScreenshot"
        material
        icon="photo_camera"
        text="Screenshot"
      />
      <Button
        v-if="!expandedView"
        @click="expandView()"
        material
        icon="open_in_full"
        text="Expand"
      />
      <Button
        v-if="expandedView"
        @click="exitExpandedView()"
        material
        icon="close_fullscreen"
        text="Return"
      />
    </div>
  </div>
</template>