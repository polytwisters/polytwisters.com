<script setup lang="tsx">
import * as globalState from "./globalState";
import { database } from "./polytwisterDefs";
import PropertyTags from "./PropertyTags.vue";

const defs = database.defs;

const rows = defs.map((def) => def.asFields());
</script>

<template>
  <table class="w-full relative">
    <thead>
      <tr class="text-left sticky top-0 bg-black">
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
        class="cursor-pointer hover:bg-primary"
      >
        <td>{{ row.name }}</td>
        <td>{{ row.acronym ?? "" }}</td>
        <td>{{ row.symbolString }}</td>
        <td><PropertyTags :fields="row" /></td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
@import "./style.css";

td,
th {
  @apply p-1;
}
</style>
