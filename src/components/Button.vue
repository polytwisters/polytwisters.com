<script setup lang="ts">
defineEmits<{ (e: "click"): void }>();
defineProps<{
  active?: boolean;
  icon?: string;
  text?: string;
  help?: string;
  square?: boolean;
}>();
</script>

<template>
  <div class="h-8 group relative">
    <button
      :class="{
        square: icon || square,
        material: icon,
        active,
        relative: true,
      }"
      @click="$emit('click')"
    >
      <div
        :class="{
          'rotate-45': icon === 'turn_sharp_right',
          '-scale-x-100': icon === 'laps',
        }"
      >
        {{ icon ? icon : text }}
      </div>
    </button>
  </div>
</template>
