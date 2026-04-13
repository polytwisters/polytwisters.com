<script setup lang="tsx">
import { PolytwisterFields } from "@/polytwisterDefs";

defineProps<{ fields: PolytwisterFields }>();
</script>

<template>
  <div class="flex flex-row gap-1 text-sm font-normal">
    <div v-if="fields.regular" class="bg-(--color-my-red) property-tag">
      regular
    </div>
    <div v-if="fields.convex" class="bg-(--color-my-blue) property-tag">
      convex
    </div>
    <div v-if="fields.bug" class="bg-(--color-my-green) property-tag">bug</div>
  </div>
</template>

<style scoped>
@import "@/style.css";

.property-tag {
  @apply text-white my-round theme-default:p-1;
}
</style>
