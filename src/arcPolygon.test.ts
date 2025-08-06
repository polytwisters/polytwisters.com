import { test, expect } from "vitest";
import * as arcPolygon from "./arcPolygon";
import { RegionMode } from "./arcPolygon";

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

test("regions work, monotonic 1", () => {
  expect(
    arcPolygon.regions(5, 3, 1)
  ).toStrictEqual([
    { order: 5, mode: RegionMode.Both },
  ]);
});

const cases: Array<[[number, number, number, string], string]> = [
  // (n, q, d, +-), regions inner to outer
  [[2, 1, 1, "-"], "[2]"],
  [[2, 1, 1, "+"], "[1] [2]"],

  [[3, 2, 1, "-"], "[3]"],
  [[3, 2, 1, "+"], "[3] [2] [1]"],
  [[3, 2, 2, "-"], "[2]"],
  [[3, 2, 2, "+"], "[3] [1]"],

  [[3, 1, 1, "-"], "[0-]"],
  [[3, 1, 1, "+"], "[1]"],
  [[3, 1, 2, "-"], "[0-] [1]"],
  [[3, 1, 2, "+"], "[0-] [1] [2]"],
];

test.each(cases)("binary filling", (spec: [number, number, number, string], filling: string) => {
  const [n, q, d, bloatedString] = spec;
  const bloated = bloatedString === "+";
  const regions = arcPolygon.regions(n, q, d, bloated);
  const regionsString = arcPolygon.regionsToString(regions);
  expect(regionsString).toBe(filling);
});