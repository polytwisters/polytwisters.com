<script setup lang="ts">
import { useTemplateRef, onMounted } from "vue";
import * as THREE from "three";
import { Complex } from "./complex";

const canvasWidth = 300;
const canvasHeight = 300;

interface Point {
  x: number,
  y: number
}

interface Circle {
  x: number,
  y: number,
  radius: number
}

function intersectCircles(circle1: Circle, circle2: Circle): Complex[] {
    const r1 = circle1.radius;
    const r2 = circle2.radius;
    const c1 = new Complex(circle1.x, circle1.y);
    const c2 = new Complex(circle2.x, circle2.y);
    const d = c2.sub(c1).abs();
    const ell = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    const discriminant = r1 * r1 - ell * ell;
    if (discriminant < 0) {
      return [];
    }
    const tmp = new Complex(ell, -Math.sqrt(discriminant));
    const solution1 = c1.add(tmp.mulReal(1 / d).mul(c2.sub(c1)));
    const solution2 = c1.add(
      tmp
        .conj()
        .mulReal(1 / d)
        .mul(c2.sub(c1)),
    );
    return [solution1, solution2];
}

const props = defineProps<{
  n: number,
  d: number,
  bloated: boolean
}>();

const n = props.n;
const d = props.d;
const bloated = props.bloated;
const quasi = (d > n / 2) !== bloated;

const circles: Circle[] = [];

const distance = 0.3;
const circleRadius = 0.5;

for (let i = 0; i < n; i++) {
  const angle = i * d / n * 2 * Math.PI;
  circles.push({
    x: distance * Math.sin(angle),
    y: distance * Math.cos(angle),
    radius: circleRadius,
  });
}

const dots: Point[] = [];

for (let i = 0; i < n; i++) {
  const circle1 = circles[i];
  const circle2 = circles[(i + 1) % n];
  const points = intersectCircles(circle1, circle2);
  if (points.length === 0) {
    dots.push({ x: 10000, y: 10000 });
    continue;
  }
  let usePoint1 = points[0].abs() < points[1].abs();
  if (quasi) {
    usePoint1 = !usePoint1;
  }
  const point = points[usePoint1 ? 0 : 1];
  dots.push({ x: point.real, y: point.imag });
}

const canvas = useTemplateRef("canvas");

const vertexShader = `
void main() {
  gl_Position = vec4(position, 1);
}
`;

const fragmentShader = `
#define NUM_CIRCLES ${n}
#define TAU 2.0*3.14159265358979

precision highp float;
uniform vec2 iResolution;

uniform vec2 circlePositions[NUM_CIRCLES];
uniform float circleRadii[NUM_CIRCLES];
uniform vec2 dots[NUM_CIRCLES];
uniform bool bloated;

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
  );

  bool onCircle = false;
  float strokeWidth = 0.005;
  for (int i = 0; i < NUM_CIRCLES; i++) {
    vec2 center = circlePositions[i];
    float radius = circleRadii[i];
    if (abs(length(position - center) - radius) <= strokeWidth) {
      onCircle = true;
      break;
    }
  }

  bool onDot = false;
  float dotRadius = 0.02;
  for (int i = 0; i < NUM_CIRCLES; i++) {
    if (length(position - dots[i]) <= dotRadius) {
      onDot = true;
      break;
    }
  }
  
  bool onArc = false;
  float strokeWidth2 = 0.006;
  for (int i = 0; i < NUM_CIRCLES; i++) {
    vec2 center = circlePositions[i];
    float radius = circleRadii[i];
    vec2 displacement = position - center;
    if (
      abs(length(position - center) - radius) <= strokeWidth2
    ) {
      bool onSmallArc = length(position) < length(dots[i]);
      if ((onSmallArc && !bloated) || (!onSmallArc && bloated)) {
        onArc = true;
        break;
      }
    }
  }
 
  vec3 color = onDot ?
    vec3(1.0, 0.0, 0.5)
    : onArc ?
      vec3(1.0)
      : onCircle ?
        vec3(0.2)
        : vec3(0.0);

  gl_FragColor = vec4(color, 1.0);
}
`;

onMounted(() => {
  const threeCamera = new THREE.Camera();
  threeCamera.position.z = 0;

  const scene = new THREE.Scene();

  const geometry = new THREE.PlaneGeometry(2, 2);
  let material = new THREE.ShaderMaterial({
    uniforms: {
      iResolution: { value: [canvasWidth, canvasHeight] },
      circlePositions: { value: circles.map((circle) => new THREE.Vector2(circle.x, circle.y)) },
      circleRadii: { value: circles.map((circle) => circle.radius) },
      dots: { value: dots.map((dot) => new THREE.Vector2(dot.x, dot.y)) },
      bloated: { value: bloated },
    },
    vertexShader,
    fragmentShader
  });
  let mesh: THREE.Mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas.value!  });

  renderer.render(scene, threeCamera);
});
</script>

<template>
  <div class="w-fit-content flex flex-col items-center">
    <span class="text-3xl">{{ n }}/{{ d }} {{ bloated ? "bloated" : "" }}</span>
    <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
  </div>
</template>