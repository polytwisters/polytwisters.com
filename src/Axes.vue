<script setup lang="ts">
import { computed } from "vue";
import { Vector3 } from "three";

const props = defineProps({
  cameraX: { type: Vector3, required: true },
  cameraY: { type: Vector3, required: true },
  cameraDirection: { type: Vector3, required: true },
});

interface LineSpec {
  name: string;
  x: number;
  y: number;
  z: number;
  color: string;
}

const cx = 50;
const cy = 50;
const scale = 30;
const textRadius = 40;

/*
The three lines we want to draw are the axis vectors ax = (1,0,0), ay = (0,1,0),
az = (0,0,1). We are projecting these three vectors onto the camera's projection
plane. The camera's orientation is defined by two vectors cameraX and cameraY
such that screen coordinates (x, y) shoot a vector at x * cameraX + y * cameraY.

Projecting ax onto cameraX, we have

proj(ax, cameraX) = (dot(ax, cameraX) / dot(cameraX, cameraX)) cameraX
= cameraX * cameraX.x

the second equality following from an assumption that abs(cameraX) = 1.
Similarly, projecting ax onto cameraY we get cameraY * cameraY.x. So in camera
coordinates it turns out that the axis's vector is just:

(cameraX.x, cameraY.x)

so we draw a line segment from (0,0) to that in the axis display. Similarly, the
ay is displayed as (cameraX.y, cameraY.y) and az is displayed as
(cameraX.z, cameraY.z).

It is also useful to know whether the axis line segment is pointing towards or
away from the viewer. The reason for this is that the line segments sometimes
occlude each other. We accomplish this by similarly taking the dot product of
the cameraDirection with the axis, resulting in what I call "z" which is
positive if it's away from the viewer and negative if towards.

As SVG does not have an attribute that directly controls z-index, we control the 
"z-index" by sorting the order of SVG elements.
*/
const lines = computed(() => [
  {
    name: "X",
    x: props.cameraX.x,
    y: props.cameraY.x,
    z: props.cameraDirection.x,
    color: "#ff0000",
  },
  {
    name: "Y",
    x: props.cameraX.y,
    y: props.cameraY.y,
    z: props.cameraDirection.y,
    color: "#00ff00",
  },
  {
    name: "Z",
    x: props.cameraX.z,
    y: props.cameraY.z,
    z: props.cameraDirection.z,
    color: "#0000ff",
  },
]);

function sortKey(a: LineSpec, b: LineSpec): number {
  // Positive is away from the viewer, negative is towards the viewer, so we
  // flip to put the positives first.
  return -(a.z - b.z);
}

const linesSorted = computed(() => [...lines.value].sort(sortKey));
</script>

<template>
  <svg class="axes" xmlns="http://www.w3.org/2000/svg" width="100" height="100">
    <template v-for="line in linesSorted">
      <text
        :x="cx + textRadius * line.x"
        :y="
          cy +
          -textRadius *
            line.y /* Screen Y-axis is up in the raytracer, down in SVG */
        "
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="sans-serif"
        font-size="50%"
        fill="white"
      >
        {{ line.name }}
      </text>
      <line
        :x1="cx"
        :y1="cy"
        :x2="cx + scale * line.x"
        :y2="cy + -scale * line.y"
        :stroke="line.color"
        stroke-width="2"
      />
    </template>
  </svg>
</template>

<style>
.axes {
  position: absolute;
  right: 0;
  top: 0;
  pointer-events: none;
}
</style>
