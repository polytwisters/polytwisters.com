import { C2 } from "./polytwisters";
import { type Union, type Intersection } from "./csg";
import * as csg from "./csg";
import { Vector3, Matrix3 } from "three";

import { PolytwisterSymbolLike } from "./symbol";

/**
 * Rotate all points so the first point becomes (-1,0,0).
 * For some reason doesn't work exactly right, may be a bug.
 */
export function orientPoints(points: Vector3[]): Vector3[] {
  const quat = C2.inverseHopfMapNormalized(points[0]).toQuaternion().invert();
  const mat3 = new Matrix3(0, 0, 1, 0, 1, 0, 1, 0, 0);
  const result = points.map((point) =>
    point.clone().applyQuaternion(quat).applyMatrix3(mat3),
  );
  return result;
}

export function normalizePoints(points: Vector3[]): Vector3[] {
  return points.map((point) => point.clone().normalize());
}

export interface PolytwisterDef {
  name: string;
  symbol: PolytwisterSymbolLike
}

const tetratwister = {
  name: "tetratwister",
  symbol: [3, 3],
};

const bloatedTetratwister = {
  name: "bloated tetratwister",
  symbol: [3, [3, 2]],
};

const quasitetratwister = {
  name: "quasitetratwister",
  symbol: [[3, 2], 3],
};

const octatwister = {
  name: "octatwister",
  symbol: [3, 4],
};

const quasioctatwister = {
  name: "quasioctatwister",
  symbol: [[3, 2], 4],
};

const bloatedOctatwister = {
  name: "bloated octatwister",
  symbol: [3, [4, 3]],
};

const cubetwister = {
  name: "cubetwister",
  symbol: [4, 3],
};

const dodecatwister = {
  name: "dodecatwister",
  symbol: [5, 3],
};

const icosatwister = {
  name: "icosatwister",
  symbol: [3, 5],
};

function dyadicTwister(n: number): PolytwisterDef {
  const result = {
    name: `${n} dyadic twister`,
    symbol: [2, n],
  };
  return result;
}

function starDyadicTwister(n: number, d: number): PolytwisterDef {
  const operands: Intersection[] = [];

  for (let i = 0; i < n; i++) {
    const logs: number[] = [];
    for (let k = 0; k < n - d + 1; k++) {
      logs.push((i + k) % n);
    }
    operands.push({ logs });
  }

  const result = {
    name: `${n}/${d} dyadic twister`,
    symbol: [2, [n, d]],
  };
  return result;
}

export const allPolytwisterDefs: PolytwisterDef[] = [
  tetratwister,
  bloatedTetratwister,
  quasitetratwister,
  cubetwister,
  octatwister,
  quasioctatwister,
  bloatedOctatwister,
  dodecatwister,
  icosatwister,
  dyadicTwister(3),
  dyadicTwister(4),
  dyadicTwister(5),
  starDyadicTwister(3, 2),
  starDyadicTwister(4, 3),
  starDyadicTwister(5, 2),
  starDyadicTwister(5, 3),
  starDyadicTwister(5, 4),
];
