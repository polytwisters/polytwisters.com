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

const distance2 = 0.45;
const radius2 = 0.35;
</script>

<template>
  <div class="bg-black w-full min-h-screen text-white flex flex-row flex-wrap p-8">
    <template v-for="spec in specs">
      <TwisterViewer :n="spec[0]" :d="spec[1]" :bloated="false" :distance="0.3" :circle-radius="0.5" />
      <TwisterViewer :n="spec[0]" :d="spec[1]" :bloated="true" :distance="0.3" :circle-radius="0.5" />
    </template>
    <TwisterViewer :n="4" :d="1" :bloated="false" :distance="distance2" :circle-radius="radius2" comment="(alt)" />
    <TwisterViewer :n="4" :d="1" :bloated="true" :distance="distance2" :circle-radius="radius2" comment="(alt)" />
    <TwisterViewer :n="4" :d="3" :bloated="false" :distance="distance2" :circle-radius="radius2" comment="(alt)" />
    <TwisterViewer :n="4" :d="3" :bloated="true" :distance="distance2" :circle-radius="radius2" comment="(alt)" />
  
    <TwisterViewer :n="5" :d="1" :bloated="false" :distance="distance2" :circle-radius="radius2" comment="(alt)" />
    <TwisterViewer :n="5" :d="1" :bloated="true" :distance="distance2" :circle-radius="radius2" comment="(alt)" />
    <TwisterViewer :n="5" :d="4" :bloated="false" :distance="distance2" :circle-radius="radius2" comment="(alt)" />
    <TwisterViewer :n="5" :d="4" :bloated="true" :distance="distance2" :circle-radius="radius2" comment="(alt)" />

    <TwisterViewer :n="5" :d="2" :bloated="false" :distance="0.47" :circle-radius="0.46" comment="(alt 2)" :canvas-width="1000" :canvas-height="1000" />
    <TwisterViewer :n="5" :d="2" :bloated="true" :distance="0.47" :circle-radius="0.46" comment="(alt 2)" :canvas-width="1000" :canvas-height="1000" />
  </div>
</template>