<script setup lang="ts">
import TwisterViewer from "./TwisterViewer.vue";

const specs = [
  [2, 1],
  [3, 1],
  [3, 2],
  [4, 1],
  [4, 3],
  [5, 1],
  [5, 2],
  [5, 3],
  [5, 4],
];
</script>

<template>
  <div
    class="bg-black w-full min-h-screen text-white flex flex-row flex-wrap p-8"
  >
    <TwisterViewer
      :n="7"
      :d="1"
      :radius-index="1.5"
      :canvas-width="1000"
      :canvas-height="1000"
    />
    <TwisterViewer
      :n="7"
      :d="1"
      :radius-index="2.5"
      :canvas-width="1000"
      :canvas-height="1000"
    />
    <TwisterViewer
      :n="7"
      :d="1"
      :radius-index="3.5"
      :canvas-width="1000"
      :canvas-height="1000"
    />
    <TwisterViewer
      :n="7"
      :d="1"
      :radius-index="4.5"
      :canvas-width="1000"
      :canvas-height="1000"
    />
  </div>
</template>
