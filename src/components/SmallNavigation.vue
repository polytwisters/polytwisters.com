<script setup lang="ts">
import * as globalState from "@/globalState";
import Button from "@/components/Button.vue";
</script>

<template>
  <div class="flex flex-row gap-2">
    <Button
      @click="globalState.previous"
      material
      icon="skip_previous"
      help="Previous"
    />
    <Button @click="globalState.next" material icon="skip_next" help="Next" />
    <Button @click="globalState.random" material icon="casino" help="Random" />
  </div>
</template>
