<script setup lang="ts">
import { computed } from 'vue';
import TwisterCrossSection from './TwisterCrossSection.vue';
import * as globalState from './globalState';

const isQuasiregular = computed(() => globalState.polytwisterDef.value.symbol.quasiregular);
const faceIndexA = computed(() =>
  globalState.polytwister.value.polyhedron.getFaceIndexFromOrbit(0)
);
const faceIndexB = computed(() =>
  globalState.polytwister.value.polyhedron.getFaceIndexFromOrbit(1)
);
</script>

<template>
  <div class="w-full flex flex-row justify-center">
    <TwisterCrossSection :face-index="faceIndexA" /> 
    <TwisterCrossSection :face-index="faceIndexB" v-if="isQuasiregular" /> 
  </div>
</template>