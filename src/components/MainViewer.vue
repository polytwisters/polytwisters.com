<script setup lang="ts">
import {
  ref,
  computed,
  useTemplateRef,
  type Ref,
  onMounted,
  watch,
  nextTick,
} from "vue";

import * as polytwisters from "@/polytwisters";
import * as globalState from "@/globalState";
import { faceSymbolToColor } from "@/colors";
import fragmentShaderTemplate from "@/shader.glsl?raw";

import * as camera from "@/camera";
import * as cameraControls from "@/cameraControls";

import Axes from "@/Axes.vue";

import * as THREE from "three";
import { Vector3 } from "three";

// Copy some imports to global namespace so they can be used in template.
const canvasSize = globalState.canvasSize;
const crossSectionW = globalState.crossSectionW;
const cameraX = camera.x;
const cameraY = camera.y;
const cameraDirection = camera.direction;

////////////////////////////////////////////////////////////////////////////////////////////////////
// UI

const experimentalMode = false;

const fullscreen = false;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Geometry

const polytwister = globalState.polytwister;
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

const twisterColors: Ref<THREE.Color[]> = computed(
  () =>
    polytwister.value.polyhedron?.faces.map(
      (face) => new THREE.Color(faceSymbolToColor(face.symbol)),
    ) || [],
);

const shading: Ref<Shading> = ref(0);
const showRings: Ref<boolean> = ref(false);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Canvas

const canvas = useTemplateRef<HTMLCanvasElement>("canvas");

const shaderError: Ref<boolean> = ref(false);
const shaderLog: Ref<string> = ref("");

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

function getUniforms(): { [key: string]: any } {
  return {
    iResolution: { value: [canvasSize.value, canvasSize.value] },
    crossSectionW: { value: crossSectionW.value },
    cameraPosition_: { value: camera.position.value },
    cameraDirection: { value: camera.direction.value },
    cameraFocalLength: { value: camera.focalLength.value },
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

let renderingEnabled = true;

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
    globalState.canvasSize,
    (newCanvasSize) => {
      renderer.setSize(newCanvasSize, newCanvasSize, false);
      updateUniforms();
      renderer.render(scene, threeCamera);
    },
    { immediate: true },
  );

  watch(
    fragmentShader,
    (newValue) => {
      loading.value = true;

      // Disable calls to updateUniforms() and renderer.render in the middle of changing
      // polytwisters, as this can cause nondeterministic errors.
      renderingEnabled = false;

      // The "new THREE.ShaderMaterial" call below may temporarily freeze the browser as it causes
      // shaders to compile. To ensure that the loading message displays before the freeze we use
      // Vue's nextTick to wait for the DOM to update. Unfortunately even this doesn't display the
      // loading message sometimes. Waiting for 1 millisecond seems to work.
      nextTick(() => {
        setTimeout(() => {
          material = new THREE.ShaderMaterial({
            uniforms: getUniforms(),
            vertexShader: vertexShader,
            fragmentShader: newValue,
          });
          mesh.material = material;
          loading.value = false;
          renderingEnabled = true;
        }, 1);
      });
    },
    { immediate: true },
  );

  // Timing information for requestAnimationFrame.
  let t: number = 0.0;
  let lastTimestamp: number | null = null;
  function update(timestamp: number) {
    if (lastTimestamp !== null) {
      t += timestamp - lastTimestamp;
    }
    lastTimestamp = timestamp;
    tickFPSTimer();

    if (renderingEnabled) {
      updateUniforms();
      renderer.render(scene, threeCamera);
    }

    if (globalState.takingScreenshot.value) {
      const screenshot = renderer.domElement.toDataURL();
      window.open(screenshot);
      globalState.takingScreenshot.value = false;
    }
    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
});
</script>

<template>
  <!-- min-h-0 min-w-0 prevents container from growing the grid. -->
  <div class="relative w-full min-h-0 min-w-0 oldschool:bg-[#aaa]">
    <canvas
      ref="canvas"
      class="block aspect-square w-full h-full object-contain cursor-grab active:cursor-grabbing"
      @pointerdown="cameraControls.canvasPointerDown"
      @blur="cameraControls.pointerUp"
      @wheel.prevent="cameraControls.canvasWheel"
    ></canvas>

    <div
      v-if="loading"
      class="absolute top-0 left-0 w-full h-full grid grid-cols-1 grid-rows-1 place-items-center"
    >
      <div class="text-sm bg-(--color-primary) p-2 my-shadow my-round oldschool-border">
        Compiling shader...
      </div>
    </div>

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
      <pre v-if="shaderError">{{ shaderLog }}</pre>
    </div>

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
</template>
