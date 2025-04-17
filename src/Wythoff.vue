<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

import * as wythoff from "./wythoff";

const canvas = useTemplateRef<HTMLCanvasElement>("canvas2");

const schwarzTriangle = new wythoff.SchwarzTriangle(3, 5, [3, 2]);

const group = wythoff.PointGroup.fromSchwarzTriangle(schwarzTriangle);
const polyhedron = group.makePolyhedron();
const vertices = polyhedron.vertices;

onMounted(() => {
  const threeCamera = new THREE.PerspectiveCamera(45, 1.0, 1, 1000);
  threeCamera.position.z = 3;

  const scene = new THREE.Scene();

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(10, 10, 10);
  scene.add(light);
  const light2 = new THREE.AmbientLight(0xffffff, 0.1);
  scene.add(light2);

  for (let point of vertices) {
    let dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.01),
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

  for (let face of polyhedron.faces) {
    let geometry = new THREE.BufferGeometry();
    let meshVertices = [];

    let c = face.map(
      (index) => vertices[index].clone()
    ).reduce(
      (vertex1, vertex2) => vertex1.add(vertex2)
    ).multiplyScalar(1 / face.length);

    for (let i = 0; i < face.length; i++) {
      const p1 = vertices[face[i]];
      const p2 = vertices[face[(i + 1) % face.length]];
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
        color: ["red", "yellow", "blue"][face.length - 3],
        side: THREE.DoubleSide
      })
    );
    scene.add(mesh);
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