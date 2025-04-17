import { test, expect } from "vitest";
import { Vector3 } from "three";
import * as mathUtils from "./mathUtils";

test("reflect", () => {
  const x = new Vector3(0.5, 1, 1);
  const y = new Vector3(1, 0, 0);
  const z = new Vector3(-0.5, 1, 1);
  expect(mathUtils.reflect(x, y).sub(z).length()).toBe(0);
});