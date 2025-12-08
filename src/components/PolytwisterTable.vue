<script setup lang="tsx">
import { onMounted, useTemplateRef, watch } from "vue";
import * as globalState from "@/globalState";
import { database } from "@/polytwisterDefs";
import PropertyTags from "@/components/PropertyTags.vue";

const defs = database.defs;

const rows = defs.map((def) => def.asFields());

const rowElementsRef = useTemplateRef("row-elements");
const outerRef = useTemplateRef("outer");

onMounted(() => {
  watch(globalState.polytwisterID, (id) => {
    const outer = outerRef.value!;
    for (let element of rowElementsRef.value!) {
      if (element.dataset.id === id) {
        outer.scrollTop = element.offsetTop - outer.clientHeight / 2;
      }
    }
  }, { immediate: true });
});
</script>

<template>
  <div class="overflow-y-scroll scroll-auto h-full" ref="outer">
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
          @click="globalState.navigateTo(row.id)"
          :class="{
            'cursor-pointer': true,
            'hover:bg-light-primary': true,
            active: row.id === globalState.polytwisterID.value,
          }"
          :data-id="row.id"
          ref="row-elements"
        >
          <td class="text-center">{{ row.index ? row.index + "." : "" }}</td>
          <td :class="[row.name.length > 40 ? 'text-sm' : '']">
            {{ row.name }}
          </td>
          <td>{{ row.acronym ?? "" }}</td>
          <td>{{ row.symbolString }}</td>
          <td class="text-2sm"><PropertyTags :fields="row" /></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
@import "@/style.css";

td,
th {
  @apply p-1;
}

tr.active {
  @apply bg-primary font-bold;
}
</style>
