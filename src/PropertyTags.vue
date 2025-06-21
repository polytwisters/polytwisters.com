<script setup lang="tsx">
import { PolytwisterFields } from "./polytwisterDefs";

defineProps<{ fields: PolytwisterFields }>();
</script>

<template>
  <div class="flex flex-row gap-1 text-sm font-normal">
    <div v-if="fields.regular" class="bg-red-900 text-white p-1 rounded-sm">
      regular
    </div>
    <div v-else class="bg-purple-900 text-white p-1 rounded-sm">
      quasiregular
    </div>
    <div v-if="fields.convex" class="bg-blue-900 text-white p-1 rounded-sm">
      convex
    </div>
    <div v-else class="bg-orange-900 text-white p-1 rounded-sm">nonconvex</div>
    <div v-if="fields.bug" class="bg-green-900 text-white p-1 rounded-sm">
      bug
    </div>
  </div>
</template>
