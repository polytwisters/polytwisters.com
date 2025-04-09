<script setup lang="ts">
import { computed, type Ref } from "vue";
import { Polytwister, C2 } from './polytwisters';

const props = defineProps<{ polytwister: Polytwister }>();

interface Vec2 {
  x: number,
  y: number
}

interface Circle {
  center: Vec2,
  radius: number
}

const offsetX = 250;
const offsetY = 250;
const scale = 40;

const circles: Ref<Circle[]> = computed(() => {
  const polytwister = props.polytwister;
  if (!polytwister) {
    return [];
  }
  const baseLog = polytwister.logs[0];
  const u = baseLog.normalizingSU2Matrix();
  const k = 1 / baseLog.abs();

  return polytwister.logs.slice(1).map((log: C2) => {
    const logNormalized = log.multiplyBySU2Matrix(u).mulReal(k);
    const tmp = logNormalized.makeBReal();
    const a = tmp.a;
    const b = tmp.b.real;
    const center = a.conj().mulReal(1 / b);
    const radius = 1 / b;
    return {
      center: { x: center.real, y: center.imag },
      radius
    };
  });
});

</script>

<template>
  <svg viewBox="0 0 500 500">
    <circle
      v-for="circle in circles"
      :cx="offsetX + circle.center.x * scale"
      :cy="offsetY + circle.center.y * scale"
      :r="circle.radius * scale"
      fill="transparent"
      stroke="rgba(255, 255, 255, 0.5)"
      stroke-width="1" />
  </svg>
</template>

<style scoped>
</style>