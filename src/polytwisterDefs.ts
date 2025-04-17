import { C2 } from "./polytwisters";
import { type Union, type Intersection } from "./csg";
import * as csg from "./csg";
import { Vector3, Matrix3 } from "three";

import { SchwarzTriangle } from "./wythoff";
import { asFraction, type Fraction, type FractionLike } from "./fraction";

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

// Typechecking fails with the tuple [FractionLike, FractionLike] unfortunately.
export type PolytwisterSymbolLike = FractionLike[];

export class SchlafliSymbol {
  twister: Fraction;
  ringFigure: Fraction;
  
  constructor(thing: PolytwisterSymbolLike) {
    if (thing.length !== 2) {
      throw new Error("Must have length 2");
    }
    this.twister = asFraction(thing[0]);
    this.ringFigure = asFraction(thing[1]);
  }

  asSchwarzTriangle() {
    return new SchwarzTriangle(this.ringFigure, this.twister, 2);
  }
}

export interface PolytwisterDef {
  name: string;
  points: Vector3[];
  csg?: Union;
  symbol: PolytwisterSymbolLike
}

const tetratwister = {
  name: "tetratwister",
  symbol: [3, 3],
  points: orientPoints([
    new Vector3(1, 1, 1),
    new Vector3(1, -1, -1),
    new Vector3(-1, 1, -1),
    new Vector3(-1, -1, 1),
  ]),
};

const bloatedTetratwister = {
  name: "bloated tetratwister",
  symbol: [3, [3, 2]],
  points: tetratwister.points,
  csg: {
    operands: [
      { logs: [0, 1], antiLogs: [2, 3] },
      { logs: [0, 2], antiLogs: [1, 3] },
      { logs: [0, 3], antiLogs: [1, 2] },
      { logs: [1, 2], antiLogs: [0, 3] },
      { logs: [1, 3], antiLogs: [0, 2] },
      { logs: [2, 3], antiLogs: [0, 1] },
    ],
  },
};

const quasitetratwister = {
  name: "quasitetratwister",
  symbol: [[3, 2], 3],
  points: tetratwister.points,
  csg: {
    operands: [
      { logs: [1, 2, 3], antiLogs: [0] },
      { logs: [0, 2, 3], antiLogs: [1] },
      { logs: [0, 1, 3], antiLogs: [2] },
      { logs: [0, 1, 2], antiLogs: [3] },
    ],
  },
};

const octatwisterPoints = [
  [1, 1, 1],
  [1, 1, -1],
  [1, -1, 1],
  [1, -1, -1],
  [-1, 1, 1],
  [-1, 1, -1],
  [-1, -1, 1],
  [-1, -1, -1],
];

const octatwister = {
  name: "octatwister",
  symbol: [3, 4],
  points: octatwisterPoints.map((x) => new Vector3(x[0], x[1], x[2])),
};

const quasioctatwister = {
  name: "quasioctatwister",
  symbol: [[3, 2], 4],
  points: octatwister.points,
  csg: {
    operands: [
      { logs: [0, 1, 2, 3] },
      { logs: [4, 5, 6, 7] },
      { logs: [0, 1, 4, 5] },
      { logs: [2, 3, 6, 7] },
      { logs: [0, 2, 4, 6] },
      { logs: [1, 3, 5, 7] },
    ],
  },
};

const bloatedOctatwister = {
  name: "bloated octatwister",
  symbol: [3, [4, 3]],
  points: octatwister.points,
  csg: {
    operands: [
      [0, 1],
      [0, 2],
      [0, 4],
      [1, 3],
      [1, 5],
      [2, 3],
      [2, 6],
      [3, 5],
      [3, 7],
      [4, 5],
      [4, 6],
      [5, 7],
      [6, 7],
    ].map((x) => ({ logs: x })),
  },
};

const cubetwister = {
  name: "cubetwister",
  symbol: [4, 3],
  points: [
    new Vector3(1, 0, 0),
    new Vector3(-1, 0, 0),
    new Vector3(0, 1, 0),
    new Vector3(0, -1, 0),
    new Vector3(0, 0, 1),
    new Vector3(0, 0, -1),
  ],
};

let phi = (1 + Math.sqrt(5)) / 2;
let rPhi = 1 / phi; // r = reciprocal

const dodecatwister = {
  name: "dodecatwister",
  symbol: [5, 3],
  points: [
    new Vector3(0, 1, phi),
    new Vector3(0, 1, -phi),
    new Vector3(0, -1, phi),
    new Vector3(0, -1, -phi),
    new Vector3(1, phi, 0),
    new Vector3(1, -phi, 0),
    new Vector3(-1, phi, 0),
    new Vector3(-1, -phi, 0),
    new Vector3(phi, 0, 1),
    new Vector3(-phi, 0, 1),
    new Vector3(phi, 0, -1),
    new Vector3(-phi, 0, -1),
  ],
};

const icosatwister = {
  name: "icosatwister",
  symbol: [3, 5],
  points: [
    new Vector3(1, 1, 1),
    new Vector3(1, 1, -1),
    new Vector3(1, -1, 1),
    new Vector3(1, -1, -1),
    new Vector3(-1, 1, 1),
    new Vector3(-1, 1, -1),
    new Vector3(-1, -1, 1),
    new Vector3(-1, -1, -1),
    new Vector3(0, phi, rPhi),
    new Vector3(0, phi, -rPhi),
    new Vector3(0, -phi, rPhi),
    new Vector3(0, -phi, -rPhi),
    new Vector3(phi, rPhi, 0),
    new Vector3(phi, -rPhi, 0),
    new Vector3(-phi, rPhi, 0),
    new Vector3(-phi, -rPhi, 0),
    new Vector3(rPhi, 0, phi),
    new Vector3(-rPhi, 0, phi),
    new Vector3(rPhi, 0, -phi),
    new Vector3(-rPhi, 0, -phi),
  ],
};

function dyadicTwisterPoints(n: number): Vector3[] {
  const points: Vector3[] = [];
  for (let i = 0; i < n; i++) {
    const theta = (2 * Math.PI * i) / n;
    points.push(new Vector3(0, Math.cos(theta), Math.sin(theta)));
  }
  return points;
}

function dyadicTwister(n: number): PolytwisterDef {
  const points = dyadicTwisterPoints(n);
  const result = {
    name: `${n} dyadic twister`,
    symbol: [2, n],
    points,
    csg: csg.convex(n),
  };
  return result;
}

function starDyadicTwister(n: number, d: number): PolytwisterDef {
  const points = dyadicTwisterPoints(n);

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
    points,
    csg: { operands },
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
