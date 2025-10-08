<script setup lang="ts">
import { computed } from 'vue';

import SymmetryGroupDisplay from './SymmetryGroupDisplay.vue';
import * as globalState from '@/globalState.ts';

const polytwister = globalState.polytwister;
const polytwisterDef = globalState.polytwisterDef;
const polytwisterSymbol = globalState.polytwisterSymbol;
const symmetrySymbol = computed(() => polytwisterSymbol.value.symmetrySymbol());
</script>

<template>
  <div class="toolbar">
    <table class="w-full text-center table-fixed">
      <tbody>
        <tr class="text-sm">
          <th>Symbol</th>
          <th>Regular</th>
          <th>Convex</th>
          <th>Symmetry</th>
          <th>Rings</th>
          <th>Strips</th>
          <th>Twisters</th>
        </tr>
        <tr>
          <td>{{ polytwisterDef.symbol.toString_() }}</td>
          <td>{{ polytwisterDef.asFields().regular ? "Yes" : "No" }}</td>
          <td>{{ polytwisterDef.asFields().convex ? "Yes" : "No" }}</td>
          <td>
            <SymmetryGroupDisplay :symmetry-group="symmetrySymbol" />
          </td>
          <td>
            {{ polytwister.polyhedron.vertices.length }}
          </td>
          <td>
            {{ polytwister.polyhedron.edges.length }}
          </td>
          <td>
            {{ polytwister.polyhedron.faces.length }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>