<script setup lang="ts">
import { computed } from "vue";
import * as globalState from "@/globalState";
import Button from "@/components/Button.vue";
import SymmetryGroupDisplay from "@/components/SymmetryGroupDisplay.vue";

const polytwisterDef = globalState.polytwisterDef;
const polytwister = globalState.polytwister;
const symmetrySymbol = computed(() => globalState.polytwisterSymbol.value.symmetrySymbol());
</script>

<template>
  <div>
    <div class="toolbar grid grid-cols-[minmax(0,1fr)_min-content] gap-2">
      <h2
        :class="[
          'font-bold',
          'text-2xl',
          polytwisterDef.name.length > 30 ? 'tracking-tight' : '',
        ]"
      >
        {{ polytwisterDef.name }}
      </h2>
      <div class="flex flex-row gap-2">
        <Button
          @click="globalState.previous"
          material
          icon="chevron_left"
          help="Previous"
        />
        <Button
          @click="globalState.next"
          material
          icon="chevron_right"
          help="Next"
        />
        <Button
          @click="globalState.random"
          material
          icon="casino"
          help="Random"
        />
      </div>
    </div>
  
    <div class="grid grid-cols-3 items-start">
      <dl>
        <dt>Symbol</dt>
        <dd>{{ polytwisterDef.symbol.toString_() }}</dd>
        <dt>Symmetry</dt>
        <dd>
          <SymmetryGroupDisplay :symmetry-group="symmetrySymbol" />
        </dd>
        <dt>Regular</dt>
        <dd>{{ polytwisterDef.symbol.isRegular() ? "Yes" : "No" }}</dd>
        <dt>Convex</dt>
        <dd>{{ polytwisterDef.symbol.isConvex() ? "Yes" : "No" }}</dd>
      </dl>
      <dl>
        <dt>Rings</dt>
        <dd>{{ polytwister.polyhedron.vertices.length }}</dd>
        <dt>Strips</dt>
        <dd>{{ polytwister.polyhedron.edges.length }}</dd>
        <dt>Twisters</dt>
        <dd>{{ polytwister.polyhedron.faces.length }}</dd>
      </dl>
      <dl>
        <dt>Number</dt>
        <dd>{{ polytwisterDef.index ?? "(none)" }}</dd>
        <dt>Acronym</dt>
        <dd>{{ polytwisterDef.acronym }}</dd>
      </dl>
    </div>
  </div>
</template>

<style scoped>
@import "@/style.css";

dl {
  @apply grid grid-cols-2 my-2 w-50;
}

dd, dt {
  @apply py-1;
}

dt {
  @apply font-bold;
}

</style>