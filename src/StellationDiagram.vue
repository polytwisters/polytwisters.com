<script setup lang="ts">
import { computed, type Ref } from "vue";
import { Polytwister, C2 } from "./polytwisters";

const props = defineProps<{ polytwister: Polytwister }>();

const EPSILON = 1e-3;

interface Vec2 {
  x: number;
  y: number;
}

interface Circle {
  center: Vec2;
  radius: number;
}

const width = 500;
const height = 500;

const offsetX = width / 2;
const offsetY = height / 2;
const scale = 40;

const circles: Ref<Circle[]> = computed(() => {
  const polytwister = props.polytwister;
  if (!polytwister) {
    return [];
  }
  const selectePipeIndex = 0;
  const selectedPipe = polytwister.logs[selectePipeIndex];
  const u = selectedPipe.normalizingSU2Matrix();
  const k = 1 / selectedPipe.abs();

  return polytwister.logs.map((log: C2) => {
    const logNormalized = log.multiplyBySU2Matrix(u).mulReal(k);

    if (logNormalized.b.abs() <= EPSILON) {
      // This eliminates parallel pipes, including the pipe that we're currently taking the
      // stellation diagram of.
      return null;
    }

    const tmp = logNormalized.makeBReal();
    const a = tmp.a;
    const b = tmp.b.real;
    const center = a.conj().mulReal(1 / b);
    const radius = 1 / b;
    return {
      center: { x: center.real, y: center.imag },
      radius,
    };
  }).filter((x) => x !== null);
});

const opacity = computed(() => 0.3 / circles.value.length);
</script>

<template>
  <section class="my-5">
    <h1>Stellation diagram</h1>
    <svg :viewBox="`0 0 ${width} ${height}`">
      <circle
        v-for="circle in circles"
        :cx="offsetX + circle.center.x * scale"
        :cy="offsetY + circle.center.y * scale"
        :r="circle.radius * scale"
        :fill="`rgba(255, 255, 255, ${opacity})`"
        stroke="rgba(255, 255, 255, 0.5)"
        stroke-width="1"
      />
      <circle :cx="offsetX" :cy="offsetY" r="1" fill="white" />
    </svg>
  </section>
</template>

<style scoped></style>
