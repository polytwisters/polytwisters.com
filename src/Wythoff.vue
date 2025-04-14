<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue";
import * as THREE from "three";
import { Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

import * as wythoff from "./wythoff";

const canvas = useTemplateRef<HTMLCanvasElement>("canvas2");

const triangle = [4, 2, 3];

const triangleVertices = wythoff.makeSphericalTriangle(
  Math.PI / triangle[0], Math.PI / triangle[1], Math.PI / triangle[2]
);
const wythoffResult = wythoff.PointGroup.fromSchwarzTriangle(triangle[0], triangle[1], triangle[2]);
const polyhedron = wythoffResult.makePolyhedron();
const vertices = polyhedron.vertices;

onMounted(() => {
  const threeCamera = new THREE.PerspectiveCamera(45, 1.0, 1, 1000);
  threeCamera.position.z = 5;

  const scene = new THREE.Scene();

  let geometry = new THREE.SphereGeometry(1);
  let mesh: THREE.Mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ color: "#abcdef", transparent: true, opacity: 0.5 })
  );
  scene.add(mesh);

  for (let i = 0; i < 3; i++) {
    let dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.03),
      new THREE.MeshBasicMaterial({ color: ["red", "lime", "blue"][i] })
    );
    const offset = 1.05;
    const point = triangleVertices[i];
    dot.position.set(point.x * offset, point.y * offset, point.z * offset);
    scene.add(dot);
  }

  for (let point of vertices) {
    let dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.03),
      new THREE.MeshBasicMaterial()
    );
    dot.position.set(point.x, point.y, point.z);
    scene.add(dot);
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
    scene.add(line);
  }

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
  <p>{{ vertices.length }} points</p>
  <canvas ref="canvas2"></canvas>
</template>

<style scoped>
</style>