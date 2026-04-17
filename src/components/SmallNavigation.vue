<script setup lang="ts">
import * as globalState from "@/globalState";
import Button from "@/components/Button.vue";
</script>

<template>
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
    <Button @click="globalState.random" material icon="casino" help="Random" />
  </div>
</template>
