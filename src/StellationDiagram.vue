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

const offsetX = 250;
const offsetY = 250;
const scale = 40;

const circles: Ref<Circle[]> = computed(() => {
  const polytwister = props.polytwister;
  if (!polytwister) {
    return [];
  }
  const selectedPipeIndex = 0;

  // Pick a pipe that we're taking the stellation diagram of. For now this is always the first pipe
  // since all polytwisters are twister-transitive, but this will change in the future.
  const selectedPipe = polytwister.logs[selectedPipeIndex];

  // Produce a matrix in SU(2) that sends the selected pipe to (1, 0) or some phase rotation of
  // that.
  const u = selectedPipe.normalizingSU2Matrix();
  const k = 1 / selectedPipe.abs();

  return polytwister.logs.map((log: C2, i: number): Circle | null => {
    const logNormalized = log.multiplyBySU2Matrix(u).mulReal(k);

    // If b is approximately 0 then this is either the selected pipe itself or some pipe parallel to
    // it.
    if (logNormalized.b.abs() <= EPSILON) {
      return null;
    }
    // If a is approximately 0 then this pipe is antipodal to the selected pipe.
    if (logNormalized.a.abs() <= EPSILON) {
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
</script>

<template>
  <svg viewBox="0 0 500 500">
    <circle
      v-for="circle in circles"
      :cx="offsetX + circle.center.x * scale"
      :cy="offsetY + circle.center.y * scale"
      :r="circle.radius * scale"
      fill="rgba(255, 255, 255, 0.05)"
      stroke="rgba(255, 255, 255, 0.5)"
      stroke-width="1"
    />
  </svg>
</template>

<style scoped></style>
