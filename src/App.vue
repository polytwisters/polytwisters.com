<script setup lang="ts">
import { ref, computed, useTemplateRef, type Ref, onMounted, watch } from "vue";
import { Vec3, Color } from "ogl";
import * as THREE from "three";

import * as polytwisters from "./polytwisters";
import { Polytwister } from "./polytwisters";
import * as polytwisterDefs from "./polytwisterDefs";
import { type PolytwisterDef } from "./polytwisterDefs";
import * as camera from "./camera";
import * as cameraControls from "./cameraControls";
import * as csg from "./csg";
import { type CSG } from "./csg";

import Button from "./Button.vue";
import Article from "./Article.vue";
import Axes from "./Axes.vue";
import Selector from "./Selector.vue";
import WSlider from "./WSlider.vue";
import StellationDiagram from "./StellationDiagram.vue";

////////////////////////////////////////////////////////////////////////////////////////////////////
// UI

const experimentalMode = ref(false);
function toggleExperimentalMode() {
  experimentalMode.value = !experimentalMode.value;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Geometry

const crossSectionW: Ref<number> = ref(0);

const defs = polytwisterDefs.allPolytwisterDefs;
const polytwisterIndex = ref(0);
const polytwisterDef: Ref<PolytwisterDef> = computed(
  () => defs[polytwisterIndex.value],
);
const polytwister: Ref<Polytwister> = computed(() =>
  Polytwister.fromDef(polytwisterDef.value).normalized(),
);
const numPipes = computed(() => polytwister.value.numLogs);
const pipesR3 = computed(() => polytwister.value.logsR3());
const rings = computed(() => polytwister.value.findRings());
const ringDots: Ref<Vec3[]> = computed(() =>
  polytwisters.ringsCrossSection(rings.value, crossSectionW.value),
);
const numRings = computed(() => Math.max(rings.value.length, 1));
const maxNumRingDots = computed(() => numRings.value * 2);

// The fragment shader requires an array of fixed size. ringDotsPadded is a version of ringDots
// extended to always have exactly maxNumRingDots Vec3's. Dots are made "nonexistent" by setting
// their location to something large.
const ringDotsPadded: Ref<Vec3[]> = computed(() => {
  const result = ringDots.value.slice();
  while (result.length <= maxNumRingDots.value) {
    result.push(new Vec3(10e3, 10e3, 1e3));
  }
  return result;
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Color & display options

// Constants duplicated in shader.
enum Shading {
  Phong = 0,
  Debug = 1,
}

const colors = [
  "#e64980", // pink
  "#339af0", // blue
  "#22b8cf", // cyan
  "#fcc419", // yellow
  "#ff922b", // orange
  "#51cf66", // green
  "#cc5de8", // purple
  "#fa5252", // red
];

const baseColor: Ref<Color> = computed(
  () => new Color(colors[polytwisterIndex.value % colors.length]),
);

const shading: Ref<Shading> = ref(0);
const showRings: Ref<boolean> = ref(false);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Canvas

const canvas = useTemplateRef<HTMLCanvasElement>("canvas");
const canvasContainer = useTemplateRef<HTMLElement>("container");

const shaderError: Ref<boolean> = ref(false);
const shaderLog: Ref<string> = ref("");

let canvasWidth = 0;
let canvasHeight = 0;

let canvasAspectRatio = 16 / 9;

function setCanvasWidth(newCanvasWidth: number) {
  canvasWidth = newCanvasWidth;
  canvasHeight = canvasWidth / canvasAspectRatio;
  cameraControls.setCanvasScale(Math.min(canvasWidth, canvasHeight));
}

setCanvasWidth(1000);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Shader codegen

import fragmentShaderTemplate from "./shader.glsl?raw";

const fragmentShaderCSGTree: Ref<CSG> = computed(
  () => polytwisterDef.value.csg ?? csg.convex(numPipes.value),
);

const fragmentShaderCSGCode: Ref<string> = computed(() =>
  csg.csgCodeGen(fragmentShaderCSGTree.value),
);

const fragmentShader = computed(() =>
  fragmentShaderTemplate
    .replace("$maxNumRingDots", maxNumRingDots.value.toString())
    .replace("$numPipes", numPipes.value.toString())
    .replace("$csgCode", fragmentShaderCSGCode.value),
);

const vertexShader = `
void main() {
  gl_Position = vec4(position, 1);
}
`;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Rendering

const loading = ref(false);

watch(polytwister, () => {
  camera.reset();
  crossSectionW.value = 0;
});

function getUniforms(): {[key: string]: any} {
  return {
    iResolution: { value: [canvasWidth, canvasHeight] },
    crossSectionW: { value: crossSectionW.value },
    cameraPosition_: { value: camera.position.value },
    cameraDirection: { value: camera.direction.value },
    cameraX: { value: camera.x.value },
    cameraY: { value: camera.y.value },
    pipes: { value: pipesR3.value },
    ringDots: { value: ringDotsPadded.value },
    shading: { value: shading.value },
    showRings: { value: showRings.value },
    baseColor: { value: baseColor.value },
  };
}

onMounted(() => {
  cameraControls.enablePointerEvents();

  const threeCamera = new THREE.Camera();
  threeCamera.position.z = 0;

  const scene = new THREE.Scene();

  const geometry = new THREE.PlaneGeometry(2, 2);

  let mesh: THREE.Mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
    color: new THREE.Color().setHex(0x123456)
  }));
  scene.add(mesh);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas.value!  });
  let material: THREE.ShaderMaterial | null = null;

  renderer.setSize(800, 500);
  renderer.render(scene, threeCamera);

  watch(
    fragmentShader,
    (newValue) => {
      loading.value = true;
      material = new THREE.ShaderMaterial({
        uniforms: getUniforms(),
        vertexShader: vertexShader,
        fragmentShader: newValue
      });
      mesh.material = material;
      loading.value = false;
    },
    { immediate: true },
  );

  let t: number = 0.0;
  let lastTimestamp: number | null = null;
  function update(timestamp: number) {
    if (lastTimestamp !== null) {
      t += timestamp - lastTimestamp;
    }
    lastTimestamp = timestamp;
    if (material) {
      const newUniforms = getUniforms();
      for (let key of Object.keys(newUniforms)) {
        material.uniforms[key].value = newUniforms[key].value;
      }
    }
    renderer.render(scene, threeCamera);
    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
});

// For some reason the Axes props don't work if I try to use the imports
// directly.
const cameraX = camera.x;
const cameraY = camera.y;
const cameraDirection = camera.direction;
</script>

<template>
  <div class="flex flex-col items-center text-slate-100">
    <div class="flex flex-col gap-2 max-w-200">
      <div class="flex flex-row items-center m-5">
        <div class="flex-1"></div>
        <h1 class="flex-1 text-3xl font-bold text-center">Polytwisters</h1>
        <div class="flex-1 flex flex-row items-center justify-end gap-2">
          <a target="_blank" href="https://github.com/polytwisters/polytwisters.com/">
            source code
          </a>
        </div>
      </div>

      <div class="flex flex-row">
        <div class="flex flex-row gap-2 flex-1">
          <Button @click="camera.reset" material icon="home" help="Reset camera" />
          <Button @click="cameraControls.zoomIn" material icon="add" help="Zoom in" />
          <div class="size-8 py-1 -mx-1 text-center material text-gray-200 select-none">search</div>
          <Button @click="cameraControls.zoomOut" material icon="remove" help="Zoom out" />
        </div>
        <Selector :defs="defs" v-model="polytwisterIndex" />
        <div class="flex-1 flex flex-row justify-end">
          <Button @click="toggleExperimentalMode" material icon="science" help="Experimental features" :active="experimentalMode" />
        </div>
      </div>

      <div class="relative my-3" ref="container" v-if="!shaderError">
        <canvas
          ref="canvas"
          @pointerdown="cameraControls.canvasPointerDown"
          @wheel.prevent="cameraControls.canvasWheel"
        ></canvas>
        <Axes
          :cameraX="cameraX"
          :cameraY="cameraY"
          :cameraDirection="cameraDirection"
        />
        <div
          class="absolute top-0 left-0 size-full flex items-center justify-center"
          v-if="false"
        >
          <div class="material-symbols-rounded animate-spin">
            progress_activity
          </div>
        </div>
      </div>
      <pre v-if="shaderError">{{ shaderLog }}</pre>

      <WSlider v-model="crossSectionW" />

      <StellationDiagram :polytwister="polytwister" v-if="experimentalMode" />
      <Article />
    </div>
  </div>
</template>

<style>
@import "./style.css";

body {
  background-color: black;
}

input[type="range"] {
  -webkit-appearance: none;
  background: transparent;
}

input[type="range"]::-moz-range-track {
  @apply bg-primary h-2 rounded-full;
}

input[type="range"]::-webkit-slider-runnable-track {
  @apply bg-primary h-2 rounded-full;
}

input[type="range"]::-moz-range-thumb {
  @apply bg-gray-200 size-4 rounded-full border-none cursor-pointer;
}

input[type="range"]::-webkit-slider-thumb {
  @apply bg-gray-200 size-4 rounded-full border-none cursor-pointer -mt-1;
  -webkit-appearance: none;
}

input[type="number"] {
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
