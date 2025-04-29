import { test, expect } from "vitest";
import * as mathUtils from "./mathUtils";
import * as wythoff from "./wythoff";

test("SchwarzTriangles' vertices have correct interior angles", () => {
  const triangle = new wythoff.SchwarzTriangle(2, 3, 5);
  const result = triangle.vertices();

  for (let vector of result) {
    expect(vector.length()).toBeCloseTo(1.0);
  }

  const expectedAngle1 = mathUtils.reject(result[1], result[0]).angleTo(
    mathUtils.reject(result[2], result[0])
  );
  expect(expectedAngle1).toBeCloseTo(triangle.angle1);

  const expectedAngle2 = mathUtils.reject(result[2], result[1]).angleTo(
    mathUtils.reject(result[0], result[1])
  );
  expect(expectedAngle2).toBeCloseTo(triangle.angle2);

  const expectedAngle3 = mathUtils.reject(result[1], result[2]).angleTo(
    mathUtils.reject(result[0], result[2])
  );
  expect(expectedAngle3).toBeCloseTo(triangle.angle3);
});

test("SchwarzTriangle's mirrors have correct angles", () => {
  const triangle = new wythoff.SchwarzTriangle(2, 3, 5);
  const result = triangle.mirrors();
  expect(Math.PI - result[1].angleTo(result[2])).toBeCloseTo(triangle.angle1);
  expect(Math.PI - result[2].angleTo(result[0])).toBeCloseTo(triangle.angle2);
  expect(Math.PI - result[0].angleTo(result[1])).toBeCloseTo(triangle.angle3);
});

test("SchwarzTriangle.fromPoints idempotent on Mobius triangles", () => {
  const triangle = new wythoff.SchwarzTriangle(2, 3, 5);
  const vertices = triangle.vertices();
  const newTriangle = wythoff.SchwarzTriangle.mobiusFromPoints(vertices[1], vertices[2]);
  expect(newTriangle.n1).toStrictEqual(triangle.n1);
  expect(newTriangle.n2).toStrictEqual(triangle.n2);
  expect(newTriangle.n3).toStrictEqual(triangle.n3);
});

test("Icosahedral group has order 120", () => {
  const triangle = new wythoff.SchwarzTriangle(2, 3, 5);
  expect(wythoff.PointGroup.fromSchwarzTriangle(triangle).order).toBe(120);
});

test("4 | 2 3 (octahedron) has 6 vertices", () => {
  const triangle = new wythoff.SchwarzTriangle(4, 2, 3);
  const polyhedron = wythoff.PointGroup.fromSchwarzTriangle(triangle).makePolyhedron(false);
  expect(polyhedron.vertices.length).toBe(6);
  expect(polyhedron.edges.length).toBe(12);
  expect(polyhedron.faces.length).toBe(8);
});

test("5 | 2 3 (icosahedron) has 12 vertices", () => {
  const triangle = new wythoff.SchwarzTriangle(5, 2, 3);
  const polyhedron = wythoff.PointGroup.fromSchwarzTriangle(triangle).makePolyhedron(false);
  expect(polyhedron.vertices.length).toBe(12);
  expect(polyhedron.edges.length).toBe(30);
  expect(polyhedron.faces.length).toBe(20);
});

test("3 | 2 5 (dodecahedron) has 20 vertices", () => {
  const triangle = new wythoff.SchwarzTriangle(3, 2, 5);
  const polyhedron = wythoff.PointGroup.fromSchwarzTriangle(triangle).makePolyhedron(false);
  expect(polyhedron.vertices.length).toBe(20);
  expect(polyhedron.edges.length).toBe(30);
  expect(polyhedron.faces.length).toBe(12);
});

test("2 | 3 5 (icosidodecahedron) has 30 vertices", () => {
  const triangle = new wythoff.SchwarzTriangle(2, 3, 5);
  const polyhedron = wythoff.PointGroup.fromSchwarzTriangle(triangle).makePolyhedron(true);
  expect(polyhedron.vertices.length).toBe(30);
  expect(polyhedron.edges.length).toBe(60);
  expect(polyhedron.faces.length).toBe(32);
});