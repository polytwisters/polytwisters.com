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
  <div class="h-8">
    <button
      :class="{ square, active, flex: true, 'gap-1': true, 'align-middle': true }"
      @click="$emit('click')"
    >
      <span v-if="icon" class="material">
        {{ icon }}
      </span>
      <span v-if="text">
        {{ text }}
      </span>
    </button>
  </div>
</template>
