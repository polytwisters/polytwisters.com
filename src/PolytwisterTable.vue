<script setup lang="tsx">
import { database } from './polytwisterDefs';
const defs = database.defs;

const rows = defs.map((def) => def.asFields());
</script>

<template>
  <table>
    <tbody>
      <tr>
        <th>Name</th>
        <th>Acronym</th>
        <th>Symbol</th>
        <th>Regular</th>
        <th>Convex</th>
      </tr>
      <tr v-for="row in rows">
        <td>{{ row.name }}</td>
        <td>{{ row.acronym ?? "" }}</td>
        <td>{{ row.symbolString }}</td>
        <td>{{ row.regular ? "regular" : "quasiregular" }}</td>
        <td>{{ row.convex ? "convex" : "nonconvex" }}</td>
      </tr>
    </tbody>
  </table>
</template>