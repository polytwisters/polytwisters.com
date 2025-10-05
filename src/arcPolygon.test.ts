import { test, expect } from "vitest";
import * as arcPolygon from "./arcPolygon";

test("radius index works", () => {
  const n = 7;
  const q = 3;
  const radius = arcPolygon.getExampleRadius(n, q);
  expect(arcPolygon.getRadiusIndex(n, radius)).toBe(q);
});

test("radius index works, monotonic", () => {
  const n = 5;
  const q = 3;
  const radius = arcPolygon.getExampleRadius(n, q);
  expect(arcPolygon.getRadiusIndex(n, radius)).toBe(q);
});

const cases: Array<[[number, number, number, string, string], string]> = [
  // (n, q, d, v, i), regions inner to outer
  [[2, Infinity, 1, "-", "-"], "[2]"],
  [[2, Infinity, 1, "-", "+"], "[2] [1]"],

  [[3, Infinity, 1, "-", "-"], "[3]"],
  [[3, Infinity, 1, "-", "+"], "[1]"],
  [[3, Infinity, 1, "+", "-"], "[2]"],
  [[3, Infinity, 1, "+", "+"], "[3] [2] [1]"],

  [[3, 1, 1, "-", "-"], "[0-]"],
  [[3, 1, 1, "-", "+"], "[0-] [1]"],
  [[3, 1, 1, "+", "-"], "[0-] [2]"],
  [[3, 1, 1, "+", "+"], "[0-] [2] [1]"],

  [[4, Infinity, 1, "-", "-"], "[4]"],
  [[4, Infinity, 1, "-", "+"], "[4] [3] [1]"],
  [[4, Infinity, 1, "+", "-"], "[4] [2]"],
  [[4, Infinity, 1, "+", "+"], "[4] [3] [2] [1]"],

  [[4, 1, 1, "-", "-"], "[0-]"],
  [[4, 1, 1, "-", "+"], "[0-] [1]"],
  [[4, 1, 1, "+", "-"], "[0-] [2]"],
  [[4, 1, 1, "+", "+"], "[0-] [2] [1]"],

  [[5, Infinity, 1, "-", "-"], "[5]"],
  [[5, Infinity, 1, "-", "+"], "[3] [1]"],
  [[5, Infinity, 1, "+", "-"], "[4] [2]"],
  [[5, Infinity, 1, "+", "+"], "[5] [4] [3] [2] [1]"],

  [[5, Infinity, 2, "-", "-"], "[4]"],
  [[5, Infinity, 2, "-", "+"], "[5] [4] [3] [1]"],
  [[5, Infinity, 2, "+", "-"], "[5] [3]"],
  [[5, Infinity, 2, "+", "+"], "[1]"],
];

test.each(cases)(
  "binary filling %p",
  (spec: [number, number, number, string, string], filling: string) => {
    const [n, q, d, vString, iString] = spec;
    const verticesOuter = vString === "+";
    const arcsOuter = iString === "+";
    const regions = arcPolygon.regions(n, q, d, verticesOuter, arcsOuter);
    const regionsString = arcPolygon.regionsToString(regions);
    expect(regionsString).toBe(filling);
  },
);
