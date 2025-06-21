import { test, expect } from "vitest";
import { C2 } from "./complex";
import { getTorusMaxRadius } from "./polytwisters";

test("pipe intersection", () => {
  let pipe1 = C2.fromR4(0, 0.3, 1, 0.3);
  let pipe2 = C2.fromR4(1, 0.3, 1, 0.1);
  let pipe3 = C2.fromR4(1.1, -0.3, 0.4, 0.5);
  let solutions = C2.intersect(pipe1, pipe2, pipe3);
  for (let solution of solutions) {
    for (let pipe of [pipe1, pipe2, pipe3]) {
      expect(solution.distanceFromPipe(pipe)).toBeLessThan(1e-5);
    }
  }
});

test("pipe intersection 2", () => {
  let pipes = [
    C2.fromR4(Math.cos(Math.PI / 3.0), 0, Math.sin(Math.PI / 3.0), 0),
    C2.fromR4(
      1.3 * Math.cos((2 * Math.PI) / 3.0),
      0.3,
      Math.sin((2 * Math.PI) / 3.0),
      0,
    ),
    C2.fromR4(1, 0, 0, 0),
  ];
  let solutions = C2.intersectNormalized(pipes[0], pipes[1], pipes[2]);
  expect(solutions.length).toEqual(2);
  for (let pipe of pipes) {
    for (let solution of solutions) {
      expect(solution.inner(pipe).abs()).toBeCloseTo(1);
      let w = 0.1;
      let cx = solution.fiberCrossSection(w)[0];
      let r = C2.fromR4(cx.x, cx.y, cx.z, w);
      expect(r.inner(pipe).abs()).toBeCloseTo(1);
    }
  }
});

test("pipe intersection + ring cross section", () => {
  let pipe1 = C2.fromR4(Math.cos(Math.PI / 3.0), 0, Math.sin(Math.PI / 3.0), 0);
  let pipe2 = C2.fromR4(
    Math.cos((2 * Math.PI) / 3.0),
    0,
    Math.sin((2 * Math.PI) / 3.0),
    0,
  );
  let pipe3 = C2.fromR4(1, 0, 0, 0);
  let solutions = C2.intersectNormalized(pipe1, pipe2, pipe3);
  let ring = solutions[0];
  expect(ring.fiberCrossSection(0).length).toEqual(2);
  expect(ring.inner(pipe1).abs()).toEqual(1);
  expect(ring.inner(pipe2).abs()).toEqual(1);
  expect(ring.inner(pipe3).abs()).toEqual(1);
});

test("max radius of Clifford torus", () => {
  expect(getTorusMaxRadius(new C2(1, 0), new C2(0, 1))).toBeCloseTo(
    Math.sqrt(2),
  );
});

test("max radius of scaled Clifford torus", () => {
  const k = 2.0;
  expect(getTorusMaxRadius(new C2(k, 0), new C2(0, k))).toBeCloseTo(
    Math.sqrt(2) / k,
  );
});
