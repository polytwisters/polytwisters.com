<script setup lang="ts">
import { computed, toRef, useTemplateRef, watch, onMounted } from "vue";
import { SymmetrySymbol, SymmetryKind } from "@/symbol";
import * as katex from "katex";

let props = defineProps<{ symmetryGroup: SymmetrySymbol }>();
const symmetryGroup = toRef(() => props.symmetryGroup);

const baseSymmetryString = computed(() =>
  symmetryGroup.value.kind === SymmetryKind.Dihedral
    ? `D_{2 \\cdot ${symmetryGroup.value.n}}`
    : symmetryGroup.value.kind === SymmetryKind.Tetrahedral
      ? "T"
      : symmetryGroup.value.kind === SymmetryKind.Octahedral
        ? "O"
        : "I",
);

const symmetryString = computed(
  () => `\\pm[${baseSymmetryString.value} \\times S^1]`,
);

const math = useTemplateRef<HTMLElement>("math");

onMounted(() => {
  watch(
    symmetryString,
    () => {
      if (math.value) {
        katex.render(symmetryString.value, math.value);
      }
    },
    { immediate: true },
  );
});
</script>

<template>
  <div ref="math" class="text-sm"></div>
</template>
