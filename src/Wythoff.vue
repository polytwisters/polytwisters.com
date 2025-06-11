<script setup lang="ts">
import { ref, computed, watch, type Ref, onMounted, useTemplateRef } from "vue";
import * as THREE from "three";
import { Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

import * as wythoff from "./wythoff";
import { type PolytwisterSymbolLike, PolytwisterSymbol } from "./symbol";

const props = defineProps<{ symbol: PolytwisterSymbolLike }>();
const symbolFromPolytwister = computed(() => PolytwisterSymbol.from(props.symbol));

const lockToPolytwister = ref(true);
const userSymbolText = ref("");
const symbolFromUser: Ref<PolytwisterSymbol> = ref(symbolFromPolytwister.value);
const symbolError: Ref<boolean> = ref(false);

watch(symbolFromPolytwister, (newValue) => {
  if (lockToPolytwister.value) {
    userSymbolText.value = newValue.toString_();
    symbolFromUser.value = newValue;
    symbolError.value = false;
  }
}, { immediate: true });

watch(userSymbolText, (newValue) => {
  try {
    const newSymbol = PolytwisterSymbol.parse(newValue);
    symbolFromUser.value = newSymbol;
    symbolError.value = false;
  } catch (e) {
    symbolError.value = true;
  }
}, { immediate: true });

const symbol = computed(() => 
  lockToPolytwister.value ? symbolFromPolytwister.value : symbolFromUser.value
);

const canvas = useTemplateRef<HTMLCanvasElement>("canvas2");

const schwarzTriangle = computed(() => wythoff.SchwarzTriangle.fromSymbol(symbol.value));

const group = computed(() =>
  wythoff.SymmetryGroup.fromSchwarzTriangle(schwarzTriangle.value)
);
const polyhedron = computed(() => group.value.makePolyhedron(symbol.value.quasiregular));

const mirrorColors = [
  "red",
  "lime",
  "blue"
];


function makeMirrorDisk(normal: Vector3): THREE.BufferGeometry {
  const up = new Vector3(1, 1, 0);
  const x = normal.clone().cross(up);
  const y = normal.clone().cross(x);
  const numPoints = 30;
  const points = [];
  for (let j = 0; j < numPoints; j++) {
    const angle = j / numPoints * 2 * Math.PI;
    const point = (
      x.clone().multiplyScalar(Math.cos(angle))
      .add(y.clone().multiplyScalar(Math.sin(angle)))
    );
    points.push(
      point.normalize().multiplyScalar(1.1)
    );
  }

  let tmp = [];
  for (let j = 0; j < numPoints; j++) {
    const p1 = points[j];
    const p2 = points[(j + 1) % numPoints];
    tmp.push(
      p1.x, p1.y, p1.z,
      p2.x, p2.y, p2.z,
      0, 0, 0,
    );
  }
  let meshVertices = new Float32Array(tmp);

  let geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(meshVertices, 3));
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Circular wedge.
 */
function wedgeGeometry(point1: Vector3, point2: Vector3): THREE.BufferGeometry {
  const numPoints = 30;
  const points = [];
  for (let j = 0; j < numPoints; j++) {
    const t = j / (numPoints - 1);
    const point = (
      point1.clone().multiplyScalar(t).add(point2.clone().multiplyScalar(1 - t))
    );
    points.push(
      point.normalize().multiplyScalar(1.1)
    );
  }

  let tmp = [];
  for (let j = 0; j < numPoints - 1; j++) {
    const p1 = points[j];
    const p2 = points[j + 1];
    tmp.push(
      p1.x, p1.y, p1.z,
      p2.x, p2.y, p2.z,
      0, 0, 0,
    );
  }
  let meshVertices = new Float32Array(tmp);

  let geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(meshVertices, 3));
  geometry.computeVertexNormals();
  return geometry;
}

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

    const vertices = polyhedron.vertexLocations;
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
      let vertexIndices = face.vertices;
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

    const vertices2 = schwarzTriangle.value.fundamentalMobiusTriangle();
    for (let point of vertices2) {
      let dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.01),
        new THREE.MeshBasicMaterial()
      );
      dot.position.set(point.x, point.y, point.z);
      group.add(dot);
    }

    const schwarzTriangleVertices = schwarzTriangle.value.fundamentalMobiusTriangle();
    for (let i = 0; i < schwarzTriangleVertices.length; i++) {
      const geometry = makeMirrorDisk(schwarzTriangleVertices[i]);
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshPhongMaterial({ color: mirrorColors[i % 3], side: THREE.DoubleSide })
      );
      group.add(mesh);
    }

    /*
    const schwarzTriangleNormals = schwarzTriangle.value.mirrors();
    for (let i = 0; i < 3; i++) {
      const geometry = makeMirrorDisk(schwarzTriangleNormals[i]);
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({ color: mirrorColors[i], side: THREE.DoubleSide })
      );
      group.add(mesh);
    }
      */

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
    <input type="text" v-model="userSymbolText" :disabled="lockToPolytwister" :class="{ error: symbolError }">
    <input type="checkbox" v-model="lockToPolytwister" id="lock-to-polytwister">
    <label for="lock-to-polytwister">Lock to polytwister</label>
  </p>
  <canvas ref="canvas2"></canvas>
</template>

<style scoped>
</style>