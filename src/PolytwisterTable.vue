<script setup lang="tsx">
import * as globalState from "./globalState";
import { database } from "./polytwisterDefs";
const defs = database.defs;

const rows = defs.map((def) => def.asFields());
</script>

<template>
  <table>
    <tbody>
      <tr class="text-left">
        <th>Name</th>
        <th>Acronym</th>
        <th>Symbol</th>
        <th>Properties</th>
      </tr>
      <tr
        v-for="row in rows"
        @click="globalState.navigateTo(row.name)"
        class="cursor-pointer hover:bg-primary"
      >
        <td>{{ row.name }}</td>
        <td>{{ row.acronym ?? "" }}</td>
        <td>{{ row.symbolString }}</td>
        <td class="text-sm">
          <div class="flex flex-row gap-1">
            <div
              v-if="row.regular"
              class="bg-red-900 text-white p-1 rounded-sm"
            >
              regular
            </div>
            <div
              v-if="row.convex"
              class="bg-blue-900 text-white p-1 rounded-sm"
            >
              convex
            </div>
          </div>
        </td>
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
