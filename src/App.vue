<script setup lang="ts">
import { ref, computed, useTemplateRef, type Ref, onMounted, watch } from "vue";
import * as _ from "lodash";
import * as THREE from "three";
import { Vector3 } from "three";

import * as polytwisters from "./polytwisters";
import { Polytwister } from "./polytwisters";
import * as camera from "./camera";
import * as cameraControls from "./cameraControls";
import { PolytwisterSymbol } from "./symbol";
import * as globalState from "./globalState";

import Button from "./Button.vue";
import Article from "./Article.vue";
import Axes from "./Axes.vue";
import WSlider from "./WSlider.vue";
import StellationDiagram from "./StellationDiagram.vue";
import Wythoff from "./Wythoff.vue";

import fragmentShaderTemplate from "./shader.glsl?raw";
import PolytwisterTable from "./PolytwisterTable.vue";
import PropertyTags from "./PropertyTags.vue";
import { fractionToString } from "./fraction";
import { database } from "./polytwisterDefs";
import TwisterCrossSections from "./TwisterCrossSections.vue";

////////////////////////////////////////////////////////////////////////////////////////////////////
// UI

const fullscreen = ref(false);
function toggleFullscreen() {
  fullscreen.value = !fullscreen.value;
}

function randomPolytwister() {
  globalState.polytwisterID.value = _.sample(database.defs)!.id();
}

function openHelp() {
  fullscreen.value = false;
  setTimeout(() => {
    document.getElementById("article")?.scrollIntoView();
  }, 10);
}

const devMode = import.meta.env.DEV;
const experimentalMode = ref(false);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Geometry

const crossSectionW: Ref<number> = ref(0);

const polytwister = globalState.polytwister;
const polytwisterDef = globalState.polytwisterDef;
const polytwisterSymbol = globalState.polytwisterSymbol;
const numPipes = computed(() => polytwister.value.numLogs);
const pipesR3 = computed(() => polytwister.value.logsR3());
const rings = computed(() => polytwister.value.rings);
const ringDots: Ref<Vector3[]> = computed(() =>
  polytwisters.ringsCrossSection(rings.value, crossSectionW.value),
);
const numRings = computed(() => Math.max(rings.value.length, 1));
const maxNumRingDots = computed(() => numRings.value * 2);

// The fragment shader requires an array of fixed size. ringDotsPadded is a version of ringDots
// extended to always have exactly maxNumRingDots Vec3's. Dots are made "nonexistent" by setting
// their location to something large.
const ringDotsPadded: Ref<Vector3[]> = computed(() => {
  const result = ringDots.value.slice();
  while (result.length <= maxNumRingDots.value) {
    result.push(new Vector3(10e3, 10e3, 1e3));
  }
  return result;
});

// Maximum extent of the polytwister. Used in the shader to reject rays that have
// no chance of hitting the sphere as a shader optimization.
const radius = 1.0;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Color & display options

// Constants duplicated in shader.
enum Shading {
  Phong = 0,
  Debug = 1,
}

const colors = {
  pink: "#e64980",
  blue: "#339af0",
  white: "#ffffff",
  lightBlue: "#a5d8ff",
  yellow: "#ffec99",
  orange: "#ff922b",
  green: "#51cf66",
  purple: "#cc5de8",
  red: "#fa5252",
};

const faceTypeToColor: Map<string, string> = new Map();
faceTypeToColor.set("2", colors.white);
faceTypeToColor.set("3", colors.lightBlue);
faceTypeToColor.set("3/2", colors.yellow);
faceTypeToColor.set("4", colors.red);
faceTypeToColor.set("4/3", colors.green);
faceTypeToColor.set("5", colors.orange);
faceTypeToColor.set("5/2", colors.blue);
faceTypeToColor.set("5/3", colors.pink);
faceTypeToColor.set("5/4", colors.purple);

const twisterColors: Ref<THREE.Color[]> = computed(
  () =>
    polytwister.value.polyhedron?.faces.map(
      (face) =>
        new THREE.Color(
          faceTypeToColor.get(fractionToString(face.symbol)) ?? "white",
        ),
    ) || [],
);

const shading: Ref<Shading> = ref(0);
const showRings: Ref<boolean> = ref(false);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Canvas

const canvas = useTemplateRef<HTMLCanvasElement>("canvas");

const shaderError: Ref<boolean> = ref(false);
const shaderLog: Ref<string> = ref("");

let canvasAspectRatio = 16 / 9;

const canvasHeights = [240, 360, 480, 720, 1080, 2160];

let canvasHeight: Ref<number> = ref(480);
let canvasWidth: Ref<number> = computed(
  () => canvasHeight.value * canvasAspectRatio,
);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Shader codegen

const fragmentShader = computed(() =>
  fragmentShaderTemplate
    .replace("$maxNumRingDots", maxNumRingDots.value.toString())
    .replace("$numPipes", numPipes.value.toString())
    .replace("$twisterCode", polytwister.value.twisterCode()),
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

function getUniforms(): { [key: string]: any } {
  return {
    iResolution: { value: [canvasWidth.value, canvasHeight.value] },
    crossSectionW: { value: crossSectionW.value },
    cameraPosition_: { value: camera.position.value },
    cameraDirection: { value: camera.direction.value },
    cameraX: { value: camera.x.value },
    cameraY: { value: camera.y.value },
    pipes: { value: pipesR3.value },
    ringDots: { value: ringDotsPadded.value },
    shading: { value: shading.value },
    showRings: { value: showRings.value },
    colors: { value: twisterColors.value },
    radius: { value: radius },
  };
}

let takingScreenshot = false;

function takeScreenshot() {
  takingScreenshot = true;
}

let fpsFrames = 0;
let fpsTimerLastCheckpoint: DOMHighResTimeStamp | null = null;
const fps = ref(0.0);
function resetFPSTimer() {
  fpsFrames = 0;
  fpsTimerLastCheckpoint = performance.now();
}
function tickFPSTimer() {
  if (fpsTimerLastCheckpoint === null) {
    resetFPSTimer();
    return;
  }
  fpsFrames += 1;
  const time = performance.now();
  const elapsedMilliseconds = time - fpsTimerLastCheckpoint;
  const elapsedSeconds = elapsedMilliseconds / 1000;
  if (elapsedSeconds > 1.0) {
    fps.value = fpsFrames / elapsedSeconds;
    resetFPSTimer();
  }
}

onMounted(() => {
  cameraControls.enablePointerEvents();

  const threeCamera = new THREE.Camera();
  threeCamera.position.z = 0;

  const scene = new THREE.Scene();

  const geometry = new THREE.PlaneGeometry(2, 2);

  let mesh: THREE.Mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHex(0x000000),
    }),
  );
  scene.add(mesh);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas.value!,
    alpha: true,
  });
  let material: THREE.ShaderMaterial | null = null;

  function updateUniforms() {
    if (material) {
      const newUniforms = getUniforms();
      for (let key of Object.keys(newUniforms)) {
        material.uniforms[key].value = newUniforms[key].value;
      }
    }
  }

  watch(
    [canvasWidth, canvasHeight],
    ([newCanvasWidth, newCanvasHeight]) => {
      renderer.setSize(newCanvasWidth, newCanvasHeight, false);
      updateUniforms();
      renderer.render(scene, threeCamera);
    },
    { immediate: true },
  );

  watch(
    fragmentShader,
    (newValue) => {
      loading.value = true;
      material = new THREE.ShaderMaterial({
        uniforms: getUniforms(),
        vertexShader: vertexShader,
        fragmentShader: newValue,
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
    tickFPSTimer();
    updateUniforms();

    renderer.render(scene, threeCamera);
    if (takingScreenshot) {
      const screenshot = renderer.domElement.toDataURL();
      window.open(screenshot);
      takingScreenshot = false;
    }
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
        <div class="flex-1">
          <label v-if="devMode">
            <input type="checkbox" v-model="experimentalMode" />
            dev mode
          </label>
        </div>
        <h1 class="flex-1 text-3xl font-bold text-center">Polytwisters</h1>
        <div class="flex-1 flex flex-row items-center justify-end gap-2">
          <a
            target="_blank"
            href="https://github.com/polytwisters/polytwisters.com/"
          >
            source code
          </a>
        </div>
      </div>

      <!-- fullscreen container -->
      <div
        :class="[
          'flex',
          'flex-col',
          'gap-2',
          ...(fullscreen
            ? [
                'fixed',
                'left-0',
                'top-0',
                'z-10',
                'bg-black',
                'w-screen',
                'h-screen',
                'p-3',
              ]
            : []),
        ]"
      >
        <!-- Top bar: name, basic navigation, settings, fullscreen -->

        <div class="toolbar flex flex-row items-center">
          <div class="flex-1 flex flex-row items-baseline gap-2">
            <div v-if="polytwisterDef.index !== undefined">
              {{ polytwisterDef.index }}.
            </div>
            <h2
              :class="[
                'font-bold',
                'text-xl',
                polytwisterDef.name.length > 30 ? 'tracking-tight' : '',
              ]"
            >
              {{ polytwisterDef.name }}
            </h2>
            <div :class="[polytwisterDef.name.length > 40 ? 'text-sm' : '']">
              ({{ polytwisterDef.acronym }})
            </div>
          </div>
          <div class="flex flex-row justify-end gap-2">
            <Button
              @click="globalState.previous"
              material
              icon="chevron_left"
              help="Previous"
            />
            <Button
              @click="globalState.next"
              material
              icon="chevron_right"
              help="Next"
            />
            <Button
              @click="randomPolytwister"
              material
              icon="casino"
              help="Random"
            />
            <Button @click="openHelp" material icon="help" help="About" />
            <Button
              material
              :icon="fullscreen ? 'fullscreen_exit' : 'fullscreen'"
              help="Fullscreen"
              @click="toggleFullscreen"
            />
          </div>
        </div>

        <!-- Bar 2: symbol, face vector, etc. -->

        <div class="toolbar flex flex-row gap-5 justify-begin">
          <div class="w-40">
            <strong>Symbol:</strong> {{ polytwisterDef.symbol.toString_() }}
          </div>
          <div class="w-40">
            <PropertyTags :fields="polytwisterDef.asFields()" />
          </div>
          <div class="w-40" v-if="polytwisterDef.acronym && false">
            <strong>Acronym:</strong> {{ polytwisterDef.acronym }}
          </div>
          <div class="flex flex-row justify-end flex-1">
            <div class="w-25">
              <strong>Rings:</strong>
              {{ polytwister.polyhedron.vertices.length }}
            </div>
            <div class="w-25">
              <strong>Strips:</strong> {{ polytwister.polyhedron.edges.length }}
            </div>
            <div class="w-25">
              <strong>Twisters:</strong>
              {{ polytwister.polyhedron.faces.length }}
            </div>
          </div>
        </div>

        <!-- Bar 3: View controls. -->

        <div class="toolbar flex flex-row">
          <div class="flex flex-row gap-2 flex-1">
            <Button
              @click="camera.reset"
              material
              icon="home"
              help="Reset camera"
            />
            <Button
              @click="cameraControls.zoomIn"
              material
              icon="add"
              help="Zoom in"
            />
            <div
              class="size-8 py-1 -mx-1 text-center material text-gray-200 select-none"
            >
              search
            </div>
            <Button
              @click="cameraControls.zoomOut"
              material
              icon="remove"
              help="Zoom out"
            />
          </div>
          <div class="flex-1 flex flex-row justify-end gap-2">
            <select v-model="canvasHeight" class="button text-center">
              <option v-for="height in canvasHeights" :value="height">
                {{ Math.floor(height * canvasAspectRatio) }}&times;{{
                  height
                }}px
              </option>
            </select>
            <Button
              @click="takeScreenshot"
              material
              icon="photo_camera"
              help="Take screenshot"
            />
          </div>
        </div>

        <!-- Main viewer. -->

        <div
          :class="[
            'flex',
            'flex-row',
            'items-center',
            'justify-center',
            ...(fullscreen
              ? ['fixed', 'left-0', 'top-0', 'w-screen', 'h-screen']
              : ['relative']),
          ]"
          ref="container"
          v-if="!shaderError"
        >
          <canvas
            ref="canvas"
            :class="['block', ...(fullscreen ? ['h-full'] : ['w-full'])]"
            :style="{ 'aspect-ratio': canvasAspectRatio + ' / 1' }"
            @pointerdown="cameraControls.canvasPointerDown"
            @wheel.prevent="cameraControls.canvasWheel"
          ></canvas>

          <!--
          Axes are hidden in fullscreen out of pure laziness. They don't
          position properly with the position:fixed parent.
          -->
          <Axes
            :cameraX="cameraX"
            :cameraY="cameraY"
            :cameraDirection="cameraDirection"
            v-if="!fullscreen && experimentalMode"
          />
          <div class="absolute right-0 bottom-0" v-if="experimentalMode">
            {{ Math.round(fps) }}FPS
          </div>
        </div>
        <pre v-if="shaderError">{{ shaderLog }}</pre>

        <div
          :class="fullscreen ? ['absolute', 'bottom-0', 'w-full', 'p-8'] : []"
        >
          <WSlider v-model="crossSectionW" />
        </div>
      </div>

      <template v-if="!fullscreen">
        <PolytwisterTable />

        <TwisterCrossSections />

        <Wythoff :symbol="polytwisterSymbol" v-if="experimentalMode" />
        <StellationDiagram :polytwister="polytwister" v-if="experimentalMode" />

        <Article />
      </template>
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

.toolbar {
  @apply z-20;
}
</style>
