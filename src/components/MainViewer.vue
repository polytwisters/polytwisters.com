<script setup lang="ts">
import {
  ref,
  computed,
  useTemplateRef,
  type Ref,
  onMounted,
  watch,
  onUnmounted,
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
import { encodeRegionMode, type Region } from "@/arcPolygon";

// Copy some imports to global namespace so they can be used in template.
const canvasSize = globalState.canvasSize;
const crossSectionW = globalState.crossSectionW;
const cameraX = camera.x;
const cameraY = camera.y;
const cameraDirection = camera.direction;

////////////////////////////////////////////////////////////////////////////////////////////////////
// UI

const devMode = globalState.devMode;

const fullscreen = false;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Geometry

const maxNumPipes = 50;
const maxNeighbors = 8;
const maxNumRegions = 8;
const maxNumRingDots = 200;
const maxNumStrips = 100;

const polytwister = globalState.polytwister;
const numPipes = computed(() => polytwister.value.numLogs);
const pipesR3 = computed(() => polytwister.value.logsR3());
const orthogonalPipesR3 = computed(() => polytwister.value.orthogonalPipesR3());

const twisterNeighborIndices = computed(() =>
  polytwister.value.twisterNeighbors(),
);
const regions = computed(() =>
  polytwister.value.regions(globalState.fillingMethod.value),
);

const rings = computed(() => polytwister.value.rings);
const ringDots: Ref<Vector3[]> = computed(() =>
  polytwisters.ringsCrossSection(rings.value, crossSectionW.value),
);

const numStrips = computed(() => polytwister.value.numStrips);
const stripsOuter = computed(() => polytwister.value.bloated);
const stripPipes: Ref<[number, number][]> = computed(() =>
  polytwister.value.stripPipes(),
);

// The fragment shader requires an array of fixed size. ringDotsPadded is a version of ringDots
// extended to always have exactly maxNumRingDots Vec3's. Dots are made "nonexistent" by setting
// their location to something large.
const ringDotsPadded: Ref<Vector3[]> = computed(() => {
  const result = ringDots.value.slice();
  while (result.length <= maxNumRingDots) {
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

const twisterColors: Ref<THREE.Vector3[]> = computed(
  () =>
    polytwister.value.polyhedron?.faces.map((face) =>
      new THREE.Vector3().setFromColor(
        new THREE.Color(faceSymbolToColor(face.symbol)),
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

////////////////////////////////////////////////////////////////////////////////////////////////////
// Shader

const fragmentShader = fragmentShaderTemplate
  .replace("$maxNumRingDots", maxNumRingDots.toString())
  .replace("$maxNumPipes", maxNumPipes.toString())
  .replace("$maxNeighbors", maxNeighbors.toString())
  .replace("$maxNumRegions", maxNumRegions.toString())
  .replace("$maxNumStrips", maxNumStrips.toString());

const vertexShader = `
void main() {
  gl_Position = vec4(position, 1);
}
`;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Textures, uniforms

function write2DIntsToTexture(
  lengthTexture: THREE.DataTexture,
  valuesTexture: THREE.DataTexture,
  values: number[][],
) {
  let lengthData = lengthTexture.image.data as Uint8Array;
  let valueData = valuesTexture.image.data as Uint8Array;
  let rowStride = valuesTexture.image.width;
  lengthData.fill(0);
  valueData.fill(0);
  for (const [index, row] of values.entries()) {
    lengthData[index] = row.length;
    for (const [j, value] of row.entries()) {
      valueData[index * rowStride + j] = value;
    }
  }
  lengthTexture.needsUpdate = true;
  valuesTexture.needsUpdate = true;
}

function writeVector3sToTexture(
  texture: THREE.DataTexture,
  vectors: THREE.Vector3[],
) {
  let data = texture.image.data as Float32Array;
  data.fill(0);
  for (const [index, vector] of vectors.entries()) {
    let offset = index * 4;
    data[offset] = vector.x;
    data[offset + 1] = vector.y;
    data[offset + 2] = vector.z;
    data[offset + 3] = 1.0;
  }
  texture.needsUpdate = true;
}

function makeFloatTexture(size: number) {
  return new THREE.DataTexture(
    new Float32Array(size * 4),
    size,
    1,
    THREE.RGBAFormat,
    THREE.FloatType,
  );
}

const pipesTexture = makeFloatTexture(maxNumPipes);
const orthogonalPipesTexture = makeFloatTexture(maxNumPipes);
const twisterColorsTexture = makeFloatTexture(maxNumPipes);

const numNeighborsTexture = new THREE.DataTexture(
  new Uint8Array(maxNumPipes),
  maxNumPipes,
  1,
  THREE.RedIntegerFormat,
  THREE.UnsignedByteType,
);

// A 2D texture where each row corresponds to one pipe and each cell in the row gives the index
// of a neighboring log.
//
// Dimensions: y = pipe index, x = neighbor index
const neighborsTexture = new THREE.DataTexture(
  new Uint8Array(maxNumPipes * maxNeighbors),
  maxNeighbors,
  maxNumPipes,
  THREE.RedIntegerFormat,
  THREE.UnsignedByteType,
);

// A 1D texture where each cell corresponds to one pipe and each value is the number of regions.
const numRegionsTexture = new THREE.DataTexture(
  new Uint8Array(maxNumPipes),
  maxNumPipes,
  1,
  THREE.RedIntegerFormat,
  THREE.UnsignedByteType,
);

// A 2D texture where each row contains region information.
// Dimensions: y = pipe index, x = region index
const regionsTexture = new THREE.DataTexture(
  new Uint8Array(maxNumPipes * maxNumRegions * 2),
  maxNumRegions,
  maxNumPipes,
  THREE.RGIntegerFormat,
  THREE.UnsignedByteType,
);

function writeRegionsToTextures(
  lengthTexture: THREE.DataTexture,
  valuesTexture: THREE.DataTexture,
  values: Region[][],
) {
  let lengthData = lengthTexture.image.data as Uint8Array;
  let valueData = valuesTexture.image.data as Uint8Array;
  let rowStride = valuesTexture.image.width;
  lengthData.fill(0);
  valueData.fill(0);
  for (const [index, row] of values.entries()) {
    lengthData[index] = row.length;
    for (const [j, region] of row.entries()) {
      const offset = (index * rowStride + j) * 2;
      valueData[offset] = region.order;
      valueData[offset + 1] = encodeRegionMode(region.mode);
    }
  }
  lengthTexture.needsUpdate = true;
  valuesTexture.needsUpdate = true;
}

// 1D texture, each pair is [pipe1, pipe2]
const stripsTexture = new THREE.DataTexture(
  new Uint8Array(maxNumStrips * 2),
  maxNumStrips,
  1,
  THREE.RGIntegerFormat,
  THREE.UnsignedByteType,
);

function writeStripsToTexture(
  stripsTexture: THREE.DataTexture,
  values: [number, number][],
) {
  let valueData = stripsTexture.image.data as Uint8Array;
  valueData.fill(0);
  for (const [index, [pipe1Index, pipe2Index]] of values.entries()) {
    const offset = index * 2;
    valueData[offset] = pipe1Index;
    valueData[offset + 1] = pipe2Index;
  }
  stripsTexture.needsUpdate = true;
}

function updateTextures() {
  writeVector3sToTexture(pipesTexture, pipesR3.value);
  writeVector3sToTexture(orthogonalPipesTexture, orthogonalPipesR3.value);
  writeVector3sToTexture(twisterColorsTexture, twisterColors.value);
  write2DIntsToTexture(
    numNeighborsTexture,
    neighborsTexture,
    twisterNeighborIndices.value,
  );
  writeRegionsToTextures(numRegionsTexture, regionsTexture, regions.value);
  writeStripsToTexture(stripsTexture, stripPipes.value);
}

watch(
  [pipesR3, orthogonalPipesR3, twisterColors, twisterNeighborIndices, regions],
  () => {
    updateTextures();
  },
  { immediate: true },
);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Rendering

function getUniforms(): { [key: string]: any } {
  return {
    iResolution: { value: [canvasSize.value, canvasSize.value] },
    crossSectionW: { value: crossSectionW.value },
    cameraPosition_: { value: camera.position.value },
    cameraDirection: { value: camera.direction.value },
    cameraFocalLength: { value: camera.focalLength.value },
    cameraX: { value: camera.x.value },
    cameraY: { value: camera.y.value },
    ringDots: { value: ringDotsPadded.value },
    shading: { value: shading.value },
    showRings: { value: showRings.value },
    radius: { value: radius },

    numPipes: { value: numPipes.value },
    numStrips: { value: numStrips.value },
    stripsOuter: { value: stripsOuter.value },

    pipesTexture: { value: pipesTexture },
    orthogonalPipesTexture: { value: orthogonalPipesTexture },
    twisterColorsTexture: { value: twisterColorsTexture },
    numNeighborsTexture: { value: numNeighborsTexture },
    neighborsTexture: { value: neighborsTexture },
    numRegionsTexture: { value: numRegionsTexture },
    regionsTexture: { value: regionsTexture },
    stripsTexture: { value: stripsTexture },
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

let animationFrame: null | number = null;

onMounted(() => {
  cameraControls.enablePointerEvents();

  const threeCamera = new THREE.Camera();
  threeCamera.position.z = 0;

  const scene = new THREE.Scene();

  const geometry = new THREE.PlaneGeometry(2, 2);

  const material = new THREE.ShaderMaterial({
    uniforms: getUniforms(),
    vertexShader,
    fragmentShader,
    glslVersion: THREE.GLSL3,
  });
  let mesh: THREE.Mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas.value!,
    alpha: true,
  });

  function updateUniforms() {
    const newUniforms = getUniforms();
    for (let key of Object.keys(newUniforms)) {
      material.uniforms[key].value = newUniforms[key].value;
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
      renderer.domElement.toBlob((blob) => {
        if (blob) {
          let url = URL.createObjectURL(blob);
          window.open(url);
          URL.revokeObjectURL(url);
        }
      });
      globalState.takingScreenshot.value = false;
    }
    animationFrame = requestAnimationFrame(update);
  }
  animationFrame = requestAnimationFrame(update);
});

// Clean up to prevent leaks in Vite hot reload.
onUnmounted(() => {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
  }
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
      v-if="!fullscreen && devMode"
    />
    <div class="absolute right-0 bottom-0" v-if="devMode">
      {{ Math.round(fps) }}FPS
    </div>
  </div>
</template>
