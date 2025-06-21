<script setup lang="ts">
import { type Ref, ref, useTemplateRef, onMounted, computed, watch, toRef } from "vue";
import * as THREE from "three";
import { Complex } from "./complex";
import * as globalState from "./globalState";

const polytwister = globalState.polytwister;

const canvas = useTemplateRef("canvas");

interface Circle {
  x: number;
  y: number;
  radius: number;
}

const canvasWidth = 600;
const canvasHeight = 600;

const { faceIndex } = defineProps<{ faceIndex: number }>();
const face = computed(() => polytwister.value.polyhedron.faces[faceIndex]);

let tmp = computed(() => {
  const polyhedron = polytwister.value.polyhedron;
  const log = polytwister.value.logs[faceIndex];
  const normalizingTransform = log.normalizingSU2Matrix();
  const k = 1 / log.abs();

  const circles: Circle[] = [];

  for (let adjacentFaceIndex of polyhedron.getAdjacentFaceIndices(faceIndex)) {
    const z = polytwister.value.logs[adjacentFaceIndex]
      .multiplyBySU2Matrix(normalizingTransform)
      .mulReal(k)
      .makeBReal();
    // remove parallel pipes
    if (z.b.abs() < 1e-3) {
      continue;
    }
    const a = z.a;
    const b = z.b.real;
    circles.push({
      x: -a.real / b,
      y: a.imag / b,
      radius: 1 / b,
    });
  }

  const dots = [];
  for (let adjacentVertexIndex of face.value.vertices) {
    let z = polytwister.value.rings[adjacentVertexIndex]
      .multiplyBySU2Matrix(normalizingTransform)
      .mulReal(1 / k)
      .makeAReal();
    dots.push({ x: z.b.real, y: z.b.imag });
  }

  return { circles, dots };
});

const circles = toRef(() => tmp.value.circles);
const dots = toRef(() => tmp.value.dots);

const scale = computed(() => {
  const circle = circles.value[0];
  return (Math.hypot(circle.x, circle.y) + circle.radius) * 1.2;
});

const vertexShader = `
void main() {
  gl_Position = vec4(position, 1);
}
`;

const fragmentShaderTemplate = `
#define NUM_CIRCLES $NUM_CIRCLES
#define TAU 2.0*3.14159265358979

precision highp float;
uniform vec2 iResolution;

uniform vec2 circlePositions[NUM_CIRCLES];
uniform float circleRadii[NUM_CIRCLES];
uniform vec2 dots[NUM_CIRCLES];
uniform bool bloated;
uniform int d;
uniform float scale;
uniform vec3 fillColor;

float angle(vec2 x) {
  return atan(x.y, x.x);
}

void main() {
  vec2 positionUnipolar = gl_FragCoord.xy / iResolution;
  vec2 positionBipolar = positionUnipolar * 2.0 - 1.0;
  float aspectRatio = iResolution.x / iResolution.y;
  vec2 position = positionBipolar * vec2(
    max(aspectRatio, 1.0),
    max(1.0 / aspectRatio, 1.0)
  ) * scale;

  bool inAnywhere = length(position) < length(dots[0]);
  bool inCircles[NUM_CIRCLES];
  int circles = 0;
  for (int i = 0; i < NUM_CIRCLES; i++) {
    vec2 center = circlePositions[i];
    float radius = circleRadii[i];
    inCircles[i] = length(position - center) < radius;
    inAnywhere = inAnywhere || inCircles[i];
    if (inCircles[i]) {
      circles++;
    }
  }
  
  // normal & quasi
  bool interior =
    bloated
      ? (
        (
          d % 2 == 0
            ? circles < d && circles % 2 == 1
            : circles > d || circles % 2 == 1
        ) || circles == 0
      )
      && inAnywhere
      : (
        (
          (NUM_CIRCLES + 1 - d - circles) % 2 == 0
          && circles >= NUM_CIRCLES + 1 - d
        ) || circles == 0
      )
      && inAnywhere;

  bool onCircle = false;
  float strokeWidth = 1.0 / iResolution.x;
  for (int i = 0; i < NUM_CIRCLES; i++) {
    vec2 center = circlePositions[i];
    float radius = circleRadii[i];
    if (abs(length(position - center) - radius) <= strokeWidth * scale) {
      onCircle = true;
      break;
    }
  }

  bool onDot = false;
  float dotRadius = 10.0 / iResolution.x;
  for (int i = 0; i < NUM_CIRCLES; i++) {
    if (length(position - dots[i]) <= dotRadius * scale) {
      onDot = true;
      break;
    }
  }
  
  bool onArc = false;
  float strokeWidth2 = 1.5 / iResolution.x;
  for (int i = 0; i < NUM_CIRCLES; i++) {
    vec2 center = circlePositions[i];
    float radius = circleRadii[i];
    vec2 displacement = position - center;
    if (
      abs(length(position - center) - radius) <= strokeWidth2 * scale
    ) {
      bool onSmallArc = length(position) < length(dots[i]);
      if ((onSmallArc && !bloated) || (!onSmallArc && bloated)) {
        onArc = true;
        break;
      }
    }
  }
 
  vec3 color = onDot ?
    vec3(1.0, 1.0, 1.0)
    : onArc ?
      vec3(1.0)
      : onCircle ?
        vec3(0.2)
        : interior ?
          fillColor
          : vec3(0.0);

  gl_FragColor = vec4(color, 1.0);
}
`;

const fragmentShader = computed(() => 
  fragmentShaderTemplate.replace("$NUM_CIRCLES", `${circles.value.length}`)
);

const material = computed(() =>
  new THREE.ShaderMaterial({
    uniforms: {
      iResolution: { value: [canvasWidth, canvasHeight] },
      circlePositions: {
        value: circles.value.map((circle) => new THREE.Vector2(circle.x, circle.y)),
      },
      circleRadii: { value: circles.value.map((circle) => circle.radius) },
      dots: { value: dots.value.map((dot) => new THREE.Vector2(dot.x, dot.y)) },
      bloated: { value: polytwister.value.bloated },
      d: { value: face.value.symbol.d },
      scale: { value: scale.value },
      fillColor: { value: new THREE.Color(0.4, 0.0, 0.1) }
    },
    vertexShader,
    fragmentShader: fragmentShader.value,
  })
);

onMounted(() => {
  const threeCamera = new THREE.Camera();
  threeCamera.position.z = 0;

  const scene = new THREE.Scene();

  const geometry = new THREE.PlaneGeometry(2, 2);
  let mesh: THREE.Mesh = new THREE.Mesh(geometry, material.value);
  scene.add(mesh);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas.value! });

  watch(material, () => {
    mesh.material = material.value;
    renderer.render(scene, threeCamera);
  }, { immediate: true });

});
</script>

<template>
  <div class="w-fit-content flex flex-col items-center">
    <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
  </div>
</template>
