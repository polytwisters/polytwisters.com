<script setup lang="ts">
import Button from './Button.vue';
</script>

<template>
  <div class="flex flex-row items-center my-2">
    <h1 class="flex-1 font-bold">Polytwisters</h1>
    <div class="flex-1 flex flex-row items-center justify-end gap-2">
      <a
        target="_blank"
        href="https://github.com/polytwisters/polytwisters.com/"
      >
        source code
      </a>
      <Button material icon="help" help="About" />
    </div>
  </div>
</template>