<script setup lang="tsx">
import { onMounted, useTemplateRef, watch } from "vue";
import * as globalState from "./globalState";
import { database } from "./polytwisterDefs";
import PropertyTags from "./PropertyTags.vue";

const defs = database.defs;

const rows = defs.map((def) => def.asFields());

const rowElementsRef = useTemplateRef('row-elements');
const outerRef = useTemplateRef('outer');

onMounted(() => {
  watch(globalState.polytwisterName, (name) => {
    const outer = outerRef.value!;
    for (let element of rowElementsRef.value!) {
      if (element.dataset.name === name) {
        outer.scrollTop = element.offsetTop - outer.clientHeight / 2;
      }
    };
  });
});
</script>

<template>
  <div class="h-90 overflow-y-auto scroll-auto" ref="outer">
    <table class="w-full relative">
      <thead>
        <tr class="text-left sticky top-0 bg-black">
          <th class="text-center">#</th>
          <th>Name</th>
          <th>Acronym</th>
          <th>Symbol</th>
          <th>Properties</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          @click="globalState.navigateTo(row.name)"
          :class="{
            'cursor-pointer': true,
            'hover:bg-light-primary': true,
            'active': row.name === globalState.polytwisterName.value
          }"
          :data-name="row.name"
          ref="row-elements"
        >
          <td class="text-center">{{ row.index ?? "" }}</td>
          <td>{{ row.name }}</td>
          <td>{{ row.acronym ?? "" }}</td>
          <td>{{ row.symbolString }}</td>
          <td><PropertyTags :fields="row" /></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
@import "./style.css";

td,
th {
  @apply p-1;
}

tr.active {
  @apply bg-primary font-bold;
}
</style>
