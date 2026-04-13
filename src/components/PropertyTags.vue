<script setup lang="tsx">
import { PolytwisterFields } from "@/polytwisterDefs";

defineProps<{ fields: PolytwisterFields }>();
</script>

<template>
  <div class="flex flex-row gap-1 text-sm font-normal">
    <div v-if="fields.regular" class="bg-my-red text-white p-1 my-round">
      regular
    </div>
    <div v-if="fields.convex" class="bg-my-blue text-white p-1 my-round">
      convex
    </div>
    <div v-if="fields.bug" class="bg-my-green text-white p-1 my-round">
      bug
    </div>
  </div>
</template>
