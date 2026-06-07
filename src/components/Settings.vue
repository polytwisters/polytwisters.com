<script setup lang="ts">
import {
  Theme,
  theme,
  hideCompilingShader,
  animationDuration,
} from "@/globalState";
import Button from "./Button.vue";

defineEmits<{
  (e: "close"): void;
}>();
</script>

<template>
  <article>
    <h1>Settings</h1>

    <div class="my-5 flex gap-2">
      Animation duration:
      <input
        type="number"
        min="1"
        max="10"
        step="0.01"
        v-model.number="animationDuration"
      />
      seconds
    </div>

    <div class="my-5 flex gap-5">
      <label class="text-bold" for="theme-selector">UI theme:</label>
      <div class="flex gap-1">
        <input
          type="radio"
          id="modern"
          :value="Theme.Default"
          v-model="theme"
        />
        <label for="modern">Modern</label>
      </div>
      <div class="flex gap-1">
        <input
          type="radio"
          id="oldschool"
          :value="Theme.Oldschool"
          v-model="theme"
        />
        <label for="oldschool">Oldschool</label>
      </div>
    </div>

    <div class="my-5 flex gap-2">
      <input type="checkbox" id="hide-message" v-model="hideCompilingShader" />
      <label for="hide-message">Hide "Compiling shader" message</label>
    </div>

    <Button icon="check" text="Done" @click="$emit('close')" />
  </article>
</template>
