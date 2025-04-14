import { test, expect } from "vitest";
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

test("wythoff", () => {
  const points = wythoff.wythoff(2, 3, 4);
  expect(points.length).toBe(6);
});

test("wythoff", () => {
  const points = wythoff.wythoff(2, 3, 5);
  expect(points.length).toBe(12);
});