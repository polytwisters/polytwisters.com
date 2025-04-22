import { Vector3, Matrix3 } from "three";

export function clamp(x: number, min: number, max: number): number {
  return Math.min(Math.max(x, min), max);
}

export function fromSpherical(
  distance: number,
  azimuth: number,
  elevation: number,
): Vector3 {
  return new Vector3(
    distance * Math.cos(azimuth) * Math.cos(elevation),
    distance * Math.sin(azimuth) * Math.cos(elevation),
    distance * Math.sin(elevation),
  );
}

export function mod(x: number, y: number): number {
  return ((x % y) + y) % y;
}

/**
 * Add two matrices and return the result as a new matrix. Why doesn't Three.js have this?!
 */
function addMatrices(matrix1: Matrix3, matrix2: Matrix3): Matrix3 {
  const result = new Matrix3();
  for (let i = 0; i < 9; i++) {
    result.elements[i] = matrix1.elements[i] + matrix2.elements[i];
  }
  return result;
}

/**
 * Compute the outer product of two 3D vectors: v1 v2^T.
 */
function outer(v1: Vector3, v2: Vector3): Matrix3 {
  const result = new Matrix3();
  result.set(
    v1.x * v2.x, v1.x * v2.y, v1.x * v2.z,
    v1.y * v2.x, v1.y * v2.y, v1.y * v2.z,
    v1.z * v2.x, v1.z * v2.y, v1.z * v2.z
  );
  return result;
}

/**
 * Compute the Householder reflection matrix for a given vector: H = I - 2vv^T.
 */
export function householder(vector: Vector3): Matrix3 {
  const identity = new Matrix3();
  return addMatrices(
    identity,
    outer(vector, vector).multiplyScalar(-2)
  );
}

/**
 * Compute the max absolute element-wise difference between two matrices.
 */
export function matrixMaxError(matrix1: Matrix3, matrix2: Matrix3): number {
  const difference = addMatrices(matrix1, matrix2.clone().multiplyScalar(-1));
  return Math.max(...difference.elements.map((x) => Math.abs(x)));
}

/**
 * Rejection vector: reject A onto B.
 */
export function reject(a: Vector3, b: Vector3): Vector3 {
  return a.clone().sub(b.clone().multiplyScalar(a.dot(b) / b.dot(b)));
}

/**
 * Reflect the vector a through the plane orthogonal to unit vector b.
 */
export function reflect(a: Vector3, b: Vector3): Vector3 {
  return a.clone().sub(b.clone().multiplyScalar(2 * a.dot(b)));
}