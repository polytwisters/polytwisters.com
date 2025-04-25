<script setup lang="ts">
import { ref, computed, watch, type Ref, onMounted, useTemplateRef } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

import * as wythoff from "./wythoff";
import { type PolytwisterSymbolLike, PolytwisterSymbol } from "./symbol";

const props = defineProps<{ symbol: PolytwisterSymbolLike }>();
const symbolFromPolytwister = computed(() => PolytwisterSymbol.from(props.symbol));

const lockToPolytwister = ref(true);
const userSymbolText = ref("");
const symbol: Ref<PolytwisterSymbol> = ref(symbolFromPolytwister.value);
const symbolError: Ref<boolean> = ref(false);

watch(symbolFromPolytwister, (newValue) => {
  if (lockToPolytwister.value) {
    userSymbolText.value = newValue.toString_();
    symbol.value = newValue;
    symbolError.value = false;
  }
}, { immediate: true });

watch(userSymbolText, (newValue) => {
  try {
    const newSymbol = PolytwisterSymbol.parse(newValue);
    symbol.value = newSymbol;
    symbolError.value = false;
  } catch (e) {
    symbolError.value = true;
  }
}, { immediate: true });

const canvas = useTemplateRef<HTMLCanvasElement>("canvas2");

const schwarzTriangle = computed(() => wythoff.SchwarzTriangle.fromSymbol(symbol.value));

const group = computed(() =>
  wythoff.PointGroup.fromSchwarzTriangle(schwarzTriangle.value)
);
const polyhedron = computed(() => group.value.makePolyhedron(symbol.value.quasiregular));

onMounted(() => {
  const threeCamera = new THREE.PerspectiveCamera(45, 1.0, 1, 1000);
  threeCamera.position.z = 3;

  const scene = new THREE.Scene();

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(10, 10, 10);
  scene.add(light);
  const light2 = new THREE.AmbientLight(0xffffff, 0.1);
  scene.add(light2);

  let group: null | THREE.Group = null;

  watch(polyhedron, (polyhedron) => {
    if (group !== null) {
      scene.remove(group);
    }
    group = new THREE.Group();
    scene.add(group);

    const vertices = polyhedron.vertices;
    for (let point of vertices) {
      let dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.01),
        new THREE.MeshBasicMaterial()
      );
      dot.position.set(point.x, point.y, point.z);
      group.add(dot);
    }

    for (let edge of polyhedron.edges) {
      let geometry = new THREE.BufferGeometry();
      const point1 = vertices[edge[0]];
      const point2 = vertices[edge[1]];
      let meshVertices = new Float32Array([
        point1.x, point1.y, point1.z,
        point2.x, point2.y, point2.z,
        point2.x, point2.y, point2.z,
      ]);
      geometry.setAttribute("position", new THREE.BufferAttribute(meshVertices, 3));
      let line = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ color: "white" })
      );
      group.add(line);
    }

    for (let face of polyhedron.faces) {
      let vertexIndices = face.vertexIndices;
      let geometry = new THREE.BufferGeometry();
      let meshVertices = [];

      let c = vertexIndices.map(
        (index) => vertices[index].clone()
      ).reduce(
        (vertex1, vertex2) => vertex1.add(vertex2)
      ).multiplyScalar(1 / vertexIndices.length);

      for (let i = 0; i < vertexIndices.length; i++) {
        const p1 = vertices[vertexIndices[i]];
        const p2 = vertices[vertexIndices[(i + 1) % vertexIndices.length]];
        meshVertices.push(p1.x, p1.y, p1.z);
        meshVertices.push(c.x, c.y, c.z);
        meshVertices.push(p2.x, p2.y, p2.z);
      }
      let meshVerticesArray = new Float32Array(meshVertices);
      geometry.setAttribute("position", new THREE.BufferAttribute(meshVerticesArray, 3));
      geometry.computeVertexNormals();
      let mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshPhongMaterial({
          color: ["red", "yellow", "blue"][vertexIndices.length - 3],
          side: THREE.DoubleSide
        })
      );
      group.add(mesh);
    }
  }, { immediate: true });

  const renderer = new THREE.WebGLRenderer({ canvas: canvas.value! });
  const controls = new OrbitControls(threeCamera, renderer.domElement);

  renderer.setSize(800, 500, false);
  renderer.render(scene, threeCamera);

  let t: number = 0.0;
  let lastTimestamp: number | null = null;
  function update(timestamp: number) {
    if (lastTimestamp !== null) {
      t += timestamp - lastTimestamp;
    }
    lastTimestamp = timestamp;
    renderer.render(scene, threeCamera);
    controls.update();

    const canvas = renderer.domElement;
    threeCamera.aspect = canvas.clientWidth / canvas.clientHeight;
    threeCamera.updateProjectionMatrix();

    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
});

</script>

<template>
  <p class="flex flex-row gap-3">
    <span>Symbol:</span>
    <input type="text" v-model="userSymbolText" :disabled="lockToPolytwister" :class="{ 'bg-red-950': symbolError }">
    <input type="checkbox" v-model="lockToPolytwister" id="lock-to-polytwister">
    <label for="lock-to-polytwister">Lock to polytwister</label>
  </p>
  <canvas ref="canvas2"></canvas>
</template>

<style scoped>
</style>