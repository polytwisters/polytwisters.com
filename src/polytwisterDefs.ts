import { C2 } from "./complex";
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

function dyadicTwister(n: number): PolytwisterDef {
  const result = {
    name: `${n} dyadic twister`,
    symbol: [2, n],
  };
  return result;
}

function starDyadicTwister(n: number, d: number): PolytwisterDef {
  return {
    name: `${n}/${d} dyadic twister`,
    symbol: [2, [n, d]],
  };
}

export const allPolytwisterDefs: PolytwisterDef[] = [
  {
    name: "tetratwister",
    symbol: [3, 3],
  },
  {
    name: "quasitetratwister",
    symbol: [[3, 2], 3],
  },
  {
    name: "bloated tetratwister",
    symbol: [3, [3, 2]],
  },
  {
    name: "inverted tetratwister",
    symbol: [[3, 2], [3, 2]],
  },
  {
    name: "cube twister",
    symbol: [4, 3],
  },
  {
    name: "quasicube twister",
    symbol: [[4, 3], 3],
  },
  {
    name: "bloated cube twister",
    symbol: [4, [3, 2]],
  },
  {
    name: "inverted cubetwister",
    symbol: [[4, 3], [3, 2]],
  },
  {
    name: "octatwister",
    symbol: [3, 4],
  },
  {
    name: "quasioctatwister",
    symbol: [[3, 2], 4],
  },
  {
    name: "bloated octatwister",
    symbol: [3, [4, 3]],
  },
  {
    name: "dodecatwister",
    symbol: [5, 3],
  },
  {
    name: "quasidodecatwister",
    symbol: [[5, 4], 3],
  },
  {
    name: "bloated dodecatwister",
    symbol: [5, [3, 2]],
  },
  {
    name: "inverted dodecatwister",
    symbol: [[5, 4], [3, 2]],
  },
  {
    name: "icosatwister",
    symbol: [3, 5],
  },
  {
    name: "quasicosatwister",
    symbol: [[3, 2], 5],
  },
  {
    name: "bloated icosatwister",
    symbol: [3, [5, 4]],
  },
  {
    name: "inverted icosatwister",
    symbol: [[3, 2], [5, 4]],
  },
  dyadicTwister(3),
  dyadicTwister(4),
  dyadicTwister(5),
  starDyadicTwister(3, 2),
  {
    name: "cuboctatwister",
    symbol: [3, 4, 2],
  },
  {
    name: "icosidodecatwister",
    symbol: [3, 5, 2],
  },
  {
    name: "sheaved tetratwister",
    symbol: [2, 3, 3],
  },
  {
    name: "sheaved cubetwister",
    symbol: [4, 2, 3],
  },
  {
    name: "sheaved octatwister",
    symbol: [3, 2, 4],
  },
  {
    name: "sheaved dodecatwister",
    symbol: [5, 2, 3],
  },
  {
    name: "sheaved icosatwister",
    symbol: [3, 2, 5],
  },
  {
    name: "rectified 3 dyadic twister",
    symbol: [2, 3, 2],
  },
  {
    name: "rectified 4 dyadic twister",
    symbol: [2, 4, 2],
  },
  {
    name: "rectified 5 dyadic twister",
    symbol: [2, 5, 2],
  },
];
