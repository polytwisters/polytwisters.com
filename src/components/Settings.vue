<script setup lang="ts">
import { Theme, theme } from "@/globalState";
import Button from "./Button.vue";

defineEmits<{
  (e: 'close'): void,
}>();
</script>

<template>
  <article>
    <h1>Settings</h1>

    <div class="my-5">
      <div class="flex gap-5">
        <label class="text-bold" for="theme-selector">Theme:</label>
        <select id="theme-selector" v-model="theme">
          <option :value="Theme.Default">Default</option>
          <option :value="Theme.Oldschool">Oldschool</option>
        </select>
      </div>
    </div>

    <Button icon="check" text="Done" @click="$emit('close')" />
  </article>
</template>
