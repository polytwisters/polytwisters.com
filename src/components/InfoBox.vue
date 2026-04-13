<script setup lang="ts">
import { computed } from "vue";
import * as globalState from "@/globalState";
import SymmetryGroupDisplay from "@/components/SymmetryGroupDisplay.vue";
import SmallNavigation from "@/components/SmallNavigation.vue";

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
          'md:text-2xl',
          'text-center',
          'md:text-left',
          polytwisterDef.name.length > 30 ? 'tracking-tight' : '',
        ]"
      >
        <span
          class="md:hidden font-normal"
          v-if="polytwisterDef.index"
        >{{ polytwisterDef.index }}.</span>
        {{ polytwisterDef.name }}
      </h2>

      <div class="hidden md:block">
        <SmallNavigation />
      </div>
    </div>
  
    <div class="hidden md:grid grid-cols-3 items-start">
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