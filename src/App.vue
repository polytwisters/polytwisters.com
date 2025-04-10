<script setup lang="ts">
import { ref, computed, useTemplateRef, type Ref, onMounted, watch } from "vue";
import { Renderer, Geometry, Program, Mesh, Vec3, Color } from "ogl";

import * as polytwisters from "./polytwisters";
import { Polytwister } from "./polytwisters";
import * as polytwisterDefs from "./polytwisterDefs";
import { type PolytwisterDef } from "./polytwisterDefs";
import * as camera from "./camera";
import * as cameraControls from "./cameraControls";
import * as csg from "./csg";
import { type CSG } from "./csg";

import Article from "./Article.vue";
import Axes from "./Axes.vue";
import Selector from "./Selector.vue";
import WSlider from "./WSlider.vue";
import StellationDiagram from "./StellationDiagram.vue";

const secretDevMode = location.hash === "#secret_dev_mode";

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
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Rendering

const loading = ref(false);

watch(polytwister, () => {
  camera.reset();
  crossSectionW.value = 0;
});

const uniforms = computed(() => ({
  iResolution: { value: [canvasWidth, canvasHeight] },
  crossSectionW: { value: crossSectionW.value },
  cameraPosition: { value: camera.position.value },
  cameraDirection: { value: camera.direction.value },
  cameraX: { value: camera.x.value },
  cameraY: { value: camera.y.value },
  pipes: { value: pipesR3.value },
  ringDots: { value: ringDotsPadded.value },
  shading: { value: shading.value },
  showRings: { value: showRings.value },
  baseColor: { value: baseColor.value },
}));

onMounted(() => {
  cameraControls.enablePointerEvents();

  const renderer = new Renderer({
    canvas: canvas.value!,
    width: canvasWidth,
    height: canvasHeight,
  });
  const gl = renderer.gl;

  // Triangle that covers viewport, with UVs that still span 0 > 1 across viewport
  const geometry = new Geometry(gl, {
    position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
    uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
  });

  let mesh: Mesh | null = null;
  let program: Program | null = null;

  watch(
    fragmentShader,
    (newValue) => {
      loading.value = true;
      program = new Program(gl, {
        vertex: vertexShader,
        fragment: newValue,
        uniforms: uniforms.value,
      });
      let log = gl.getShaderInfoLog(program.fragmentShader);
      if (log !== "") {
        shaderError.value = true;
        shaderLog.value = `Error in fragment shader\n${log}`;
      }

      mesh = new Mesh(gl, { geometry, program });
      loading.value = false;
    },
    { immediate: true },
  );

  // Periodically change the canvas size to match the containing element.
  setInterval(() => {
    let newCanvasWidth = canvasWidth;
    try {
      newCanvasWidth = parseFloat(
        window
          .getComputedStyle(canvasContainer.value!)
          .getPropertyValue("width"),
      );
    } catch (e) {
      // sloppy, sometimes canvasContainer is undefined, not sure why
      return;
    }
    if (newCanvasWidth === canvasWidth) {
      return;
    }
    setCanvasWidth(newCanvasWidth);
    renderer.setSize(canvasWidth, canvasHeight);
  }, 1000);

  requestAnimationFrame(update);
  let t: number = 0.0;
  let lastTimestamp: number | null = null;
  function update(timestamp: number) {
    if (lastTimestamp !== null) {
      t += timestamp - lastTimestamp;
    }
    lastTimestamp = timestamp;
    if (program !== null) {
      program.uniforms = uniforms.value;
    }
    if (mesh !== null) {
      renderer.render({ scene: mesh });
    }
    requestAnimationFrame(update);
  }
});

// For some reason the Axes props don't work if I try to use the imports
// directly.
const cameraX = camera.x;
const cameraY = camera.y;
const cameraDirection = camera.direction;
</script>

<template>
  <div class="flex flex-col items-center text-slate-100">
    <div class="max-w-200">
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
          <button class="square material" @click="camera.reset">home</button>
          <button class="square material" @click="cameraControls.zoomIn">
            zoom_in
          </button>
          <button class="square material" @click="cameraControls.zoomOut">
            zoom_out
          </button>
        </div>
        <Selector :defs="defs" v-model="polytwisterIndex" />
        <div class="flex-1"></div>
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
          v-if="loading"
        >
          <div class="material-symbols-rounded animate-spin">
            progress_activity
          </div>
        </div>
      </div>

      <WSlider v-model="crossSectionW" />

      <StellationDiagram :polytwister="polytwister" v-if="secretDevMode" />

      <pre v-if="shaderError">{{ shaderLog }}</pre>
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
