<script setup lang="ts">
defineEmits<{ (e: "click"): void }>();
defineProps<{
  active?: boolean,
  icon?: string,
  text?: string,
  help: string,
}>();
</script>

<template>
  <div class="size-8 group relative">
    <button :class="{ square: true, material: icon, active, relative: true }" @click="$emit('click')">
      <div :class="{ 'rotate-45': icon === 'turn_sharp_right', '-scale-x-100': icon === 'laps' }">
        {{ icon ? icon : text }}
      </div>
    </button>
    <div class="
      not-group-hover:opacity-0 opacity-90 transition-opacity delay-250 select-none pointer-events-none
      absolute bottom-10 w-20 -left-6
      bg-gray-700 p-1 rounded-sm text-sm text-center">
      {{ help }}
    </div>
    <div class="
      not-group-hover:opacity-0 opacity-90 transition-opacity delay-250 select-none pointer-events-none
      absolute bottom-9 box-content size-0 left-2.5
      border-transparent border-6 border-b-0 border-t-gray-700 border-solid">
    </div>
  </div>
</template>