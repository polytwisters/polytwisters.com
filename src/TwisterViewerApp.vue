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
  <div class="bg-black w-full min-h-screen text-white flex flex-row flex-wrap">
    <template v-for="spec in specs">
      <TwisterViewer :n="spec[0]" :d="spec[1]" :bloated="false" />
      <TwisterViewer :n="spec[0]" :d="spec[1]" :bloated="true" />
    </template>
  </div>
</template>