import { test, expect } from "vitest";
import { Vec3 } from "ogl";
import * as mathUtils from "./mathUtils";

test("reflect", () => {
  const x = new Vec3(0.5, 1, 1);
  const y = new Vec3(1, 0, 0);
  const z = new Vec3(-0.5, 1, 1);
  expect(mathUtils.reflect(x, y).sub(z).len()).toBe(0);
});