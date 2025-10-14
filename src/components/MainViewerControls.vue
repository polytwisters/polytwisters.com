<script setup lang="ts">
import * as globalState from "@/globalState";
import * as camera from "@/camera";
import * as cameraControls from "@/cameraControls";
import Button from "@/components/Button.vue";

const takeScreenshot = globalState.takeScreenshot;
const canvasSize = globalState.canvasSize;

const canvasHeights = [240, 360, 480, 720, 1080, 2160];
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
        text="Take screenshot"
      />
    </div>
  </div>
</template>