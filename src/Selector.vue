<script setup lang="ts">
import { database } from "./polytwisterDefs";
import * as globalState from "./globalState";
import Button from "./Button.vue";

const defs = database.defs;
const polytwisterName = globalState.polytwisterName;

function next() {
  globalState.polytwisterName.value = database.getNextPolytwister(globalState.polytwisterName.value);
}

function previous() {
  globalState.polytwisterName.value = database.getPreviousPolytwister(globalState.polytwisterName.value);
}
</script>

<template>
  <div class="flex flex-row gap-2 justify-center flex-1">
    <Button @click="previous" material icon="chevron_left" help="Previous" />
    <select v-model="polytwisterName" class="text-center h-8 bg-primary p-1 rounded-sm">
      <option v-for="def in defs" :value="def.name">
        {{ def.name }}
      </option>
    </select>
    <Button @click="next" material icon="chevron_right" help="Next" />
  </div>
</template>

<style scoped></style>
