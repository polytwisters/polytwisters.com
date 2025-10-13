<script setup lang="ts">
import { computed } from "vue";
import TwisterCrossSection from "./TwisterCrossSection.vue";
import * as globalState from "./globalState";

const isRegular = computed(
  () => globalState.polytwisterDef.value.symbol.regular,
);
const faceIndexA = computed(() =>
  globalState.polytwister.value.polyhedron.getFaceIndexFromOrbit(0),
);
const faceIndexB = computed(() =>
  globalState.polytwister.value.polyhedron.getFaceIndexFromOrbit(1),
);
</script>

<template>
  <div class="flex flex-row justify-center h-full">
    <TwisterCrossSection :face-index="faceIndexA" />
    <TwisterCrossSection :face-index="faceIndexB" v-if="!isRegular" />
  </div>
</template>
