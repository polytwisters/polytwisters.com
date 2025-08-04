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

test("regions work, monotonic 2", () => {
  expect(
    arcPolygon.regions(5, 3, 2)
  ).toStrictEqual([
    { order: 4, mode: RegionMode.Both },
  ]);
});

test("regions work, non-monotonic", () => {
  expect(
    arcPolygon.regions(5, 2, 1)
  ).toStrictEqual([
    { order: 5, mode: RegionMode.Inner },
  ]);
});

test("regions work, monotonic 3", () => {
  expect(
    arcPolygon.regions(7, 4, 1)
  ).toStrictEqual([
    { order: 7, mode: RegionMode.Both },
  ]);
});

test("regions work, monotonic 4", () => {
  expect(
    arcPolygon.regions(7, 4, 3)
  ).toStrictEqual([
    { order: 5, mode: RegionMode.Both },
    { order: 7, mode: RegionMode.Both },
  ]);
});

test("regions work", () => {
  expect(
    arcPolygon.regions(7, 3, 1)
  ).toStrictEqual([
    { order: 0, mode: RegionMode.Inner },
  ]);
});

test("regions work", () => {
  expect(
    arcPolygon.regions(7, 3, 2)
  ).toStrictEqual([
    { order: 1, mode: RegionMode.Outer },
    { order: 0, mode: RegionMode.Inner },
  ]);
});