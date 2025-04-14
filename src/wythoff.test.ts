import { test, expect } from "vitest";
import { Vector3 } from "three";
import * as mathUtils from "./mathUtils";
import * as wythoff from "./wythoff";

test("spherical triangles", () => {
  const angle1 = Math.PI / 2;
  const angle2 = Math.PI / 3;
  const angle3 = Math.PI / 5;
  const result = wythoff.makeSphericalTriangle(angle1, angle2, angle3);

  for (let vector of result) {
    expect(vector.len()).toBeCloseTo(1.0);
  }

  const expectedAngle1 = mathUtils.reject(result[1], result[0]).angle(
    mathUtils.reject(result[2], result[0])
  );
  expect(expectedAngle1).toBeCloseTo(angle1);

  const expectedAngle2 = mathUtils.reject(result[2], result[1]).angle(
    mathUtils.reject(result[0], result[1])
  );
  expect(expectedAngle2).toBeCloseTo(angle2);

  const expectedAngle3 = mathUtils.reject(result[1], result[2]).angle(
    mathUtils.reject(result[0], result[2])
  );
  expect(expectedAngle3).toBeCloseTo(angle3);
});

test("spherical triangle mirrors", () => {
  const angle1 = Math.PI / 2;
  const angle2 = Math.PI / 3;
  const angle3 = Math.PI / 5;
  const result = wythoff.makeSphericalTriangleMirrors(angle1, angle2, angle3);
  expect(Math.PI - result[1].angle(result[2])).toBeCloseTo(angle1);
  expect(Math.PI - result[2].angle(result[0])).toBeCloseTo(angle2);
  expect(Math.PI - result[0].angle(result[1])).toBeCloseTo(angle3);
});

test("icosahedral group has order 120", () => {
  expect(wythoff.PointGroup.fromSchwarzTriangle(2, 3, 5).order).toBe(120);
});

test("octahedron 4 | 2 3 has 6 vertices", () => {
  const polyhedron = wythoff.PointGroup.fromSchwarzTriangle(4, 2, 3).makePolyhedron();
  expect(polyhedron.vertices.length).toBe(6);
  expect(polyhedron.edges.length).toBe(12);
});

test("icosahedron 5 | 2 3 has 12 vertices", () => {
  const points = wythoff.PointGroup.fromSchwarzTriangle(5, 2, 3).orbit();
  expect(points.length).toBe(12);
});

test("dodecahedron 3 | 2 5 has 20 vertices", () => {
  const points = wythoff.PointGroup.fromSchwarzTriangle(3, 2, 5).orbit();
  expect(points.length).toBe(20);
});

test("icosidodecahedron 2 | 3 5 has 30 vertices", () => {
  const points = wythoff.PointGroup.fromSchwarzTriangle(2, 3, 5).orbit();
  expect(points.length).toBe(30);
});