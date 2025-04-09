<script setup lang="ts">
import { type PolytwisterDef } from './polytwisterDefs';

const props = defineProps<{
  defs: PolytwisterDef[]
}>();
const defs = props.defs;

const index = defineModel<number>({ default: 0 });

function next() {
  index.value = (index.value + 1) % defs.length;
}

function previous() {
  index.value = (index.value - 1 + defs.length) % defs.length;
}
</script>

<template>
  <div class="flex flex-row gap-2 justify-center flex-1">
    <button class="square material" @click="previous">chevron_left</button>
    <select v-model="index" class="text-center h-8 bg-primary p-1 rounded-sm">
      <option v-for="(def, i) in defs" :value="i">
        {{ def.name }}
      </option>
    </select>
    <button class="square material" @click="next">chevron_right</button>
  </div>
</template>

<style scoped>
</style>