<script setup lang="ts">
import { type PolytwisterDef } from "./polytwisterDefs";
import Button from "./Button.vue";

const props = defineProps<{
  defs: PolytwisterDef[];
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
    <Button @click="previous" material icon="chevron_left" help="Previous" />
    <select v-model="index" class="text-center h-8 bg-primary p-1 rounded-sm">
      <option v-for="(def, i) in defs" :value="i">
        {{ def.name }}
      </option>
    </select>
    <Button @click="next" material icon="chevron_right" help="Next" />
  </div>
</template>

<style scoped></style>
