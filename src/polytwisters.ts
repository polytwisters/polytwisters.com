import { Quaternion, Vector3 } from "three";
import { PolytwisterDef } from "./polytwisterDefs";
import { type CSG } from "./csg";
import * as csg from "./csg";
import { Polyhedron, symbolToPolyhedron } from "./wythoff";
import { SchlafliSymbol } from "./symbol";

const EPSILON = 1e-5;

function square(x: number): number {
  return x * x;
}

class Complex {
  real: number;
  imag: number;

  constructor(real: number | Complex, imag: number = 0) {
    if (real instanceof Complex) {
      this.real = real.real;
      this.imag = real.imag;
      return;
    }
    this.real = real;
    this.imag = imag;
  }

  conj(): Complex {
    return new Complex(this.real, -this.imag);
  }

  add(other: Complex): Complex {
    return new Complex(this.real + other.real, this.imag + other.imag);
  }

  sub(other: Complex): Complex {
    return new Complex(this.real - other.real, this.imag - other.imag);
  }

  mulReal(other: number): Complex {
    return new Complex(this.real * other, this.imag * other);
  }

  mul(other: Complex): Complex {
    return new Complex(
      this.real * other.real - this.imag * other.imag,
      this.imag * other.real + this.real * other.imag,
    );
  }

  reciprocal(): Complex {
    const denominator = this.real * this.real + this.imag * this.imag;
    return new Complex(this.real / denominator, -this.imag / denominator);
  }

  div(other: Complex): Complex {
    return this.mul(other.reciprocal());
  }

  abs(): number {
    return Math.hypot(this.real, this.imag);
  }

  angle(): number {
    return Math.atan2(this.imag, this.real);
  }

  static fromPolar(magnitude: number, angle: number): Complex {
    return new Complex(
      magnitude * Math.cos(angle),
      magnitude * Math.sin(angle),
    );
  }

  equals(other: Complex): boolean {
    return this.real === other.real && this.imag === other.imag;
  }
}

/**
 * A 2-tuple of complex numbers.
 */
export class C2 {
  a: Complex;
  b: Complex;

  constructor(a: Complex | number, b: Complex | number) {
    this.a = new Complex(a);
    this.b = new Complex(b);
  }

  static fromR4(x: number, y: number, z: number, w: number) {
    return new C2(new Complex(x, y), new Complex(z, w));
  }

  makeBReal(): C2 {
    const result = this.mul(Complex.fromPolar(1.0, -this.b.angle()));
    return new C2(
      new Complex(result.a.real, result.a.imag),
      new Complex(result.b.real, 0.0),
    );
  }

  abs(): number {
    return Math.sqrt(
      square(this.a.real) +
        square(this.b.real) +
        square(this.a.imag) +
        square(this.b.imag),
    );
  }

  inner(other: C2): Complex {
    return this.a.mul(other.a.conj()).add(this.b.mul(other.b.conj()));
  }

  mul(scalar: Complex): C2 {
    return new C2(scalar.mul(this.a), scalar.mul(this.b));
  }

  mulReal(scalar: number): C2 {
    return new C2(this.a.mulReal(scalar), this.b.mulReal(scalar));
  }

  equals(other: C2): boolean {
    return this.a.equals(other.a) && this.b.equals(other.b);
  }

  /**
   * Convert the C2 vector into an R4 vector (x,y,z,w), ignore w and return (x,y,z).
   */
  toVector3IgnoreW(): Vector3 {
    return new Vector3(this.a.real, this.a.imag, this.b.real);
  }

  /**
   * Phase-rotate the vector to an R4 vector of the form (x,y,z,0), return (x,y,z).
   */
  toVector3W0(): Vector3 {
    let angle = this.b.angle();
    let k = Complex.fromPolar(1, -angle);
    return this.mul(k).toVector3IgnoreW();
  }

  /**
   * Interpreting this C2 as a circle in R4, find the points on it with the given w-coordinate.
   */
  fiberCrossSection(w: number): Vector3[] {
    // The w coordinate is the imaginary part of b. We want to find all unit complex k such that
    // w = Im(kb). Let b = A exp(i theta) and draw the line corresponding to Im(b) = w.
    // The intersection points are A exp(i phi_1) and A exp(i phi_2) where
    // phi_1 = arcsin(w / A) and phi_2 = pi - phi_1. Therefore the solutions for k are
    // exp(i(phi_1 - theta)) or exp(i(phi_2 - theta)).
    //
    // If w / |b| is > 1 then there are no intersections.
    const discriminant = w / this.b.abs();
    if (discriminant > 1) {
      return [];
    }
    const theta = this.b.angle();
    const phi1 = Math.asin(discriminant);
    const phi2 = Math.PI - phi1;
    const k1 = Complex.fromPolar(1.0, phi1 - theta);
    const k2 = Complex.fromPolar(1.0, phi2 - theta);
    const rotated1 = this.mul(k1);
    const rotated2 = this.mul(k2);
    const result = [rotated1.toVector3IgnoreW(), rotated2.toVector3IgnoreW()];
    return result;
  }

  /**
   * Given three pipes such that the last one is (1, 0) and their b-values are real, compute their
   * intersection.
   */
  static intersectNormalized(pipe1: C2, pipe2: C2, pipe3: C2): C2[] {
    if (!pipe3.equals(new C2(1, 0))) {
      throw new Error("pipe3 should be (1, 0)");
    }

    const a1 = pipe1.a.conj();
    const b1 = pipe1.b.conj();
    const a2 = pipe2.a.conj();
    const b2 = pipe2.b.conj();

    if (b1.imag !== 0) {
      throw new Error(`b should be real ${b1.imag}`);
    }
    if (b2.imag !== 0) {
      throw new Error("b should be real");
    }

    const r1 = 1 / b1.real;
    const r2 = 1 / b2.real;
    const c1 = a1.div(b1).mulReal(-1);
    const c2 = a2.div(b2).mulReal(-1);
    const d = c2.sub(c1).abs();
    const ell = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    const discriminant = r1 * r1 - ell * ell;
    if (discriminant < 0) {
      return [];
    }
    const tmp = new Complex(ell, -Math.sqrt(discriminant));
    const z2_a = c1.add(tmp.mulReal(1 / d).mul(c2.sub(c1)));
    const z2_b = c1.add(
      tmp
        .conj()
        .mulReal(1 / d)
        .mul(c2.sub(c1)),
    );
    const solution_a = new C2(1.0, z2_a);
    const solution_b = new C2(1.0, z2_b);

    return [solution_a, solution_b];
  }

  static intersect(pipe1: C2, pipe2: C2, pipe3: C2): C2[] {
    const u = pipe3.normalizingSU2Matrix();
    const uInv = pipe3.normalizingSU2MatrixInv();
    const k = 1 / pipe3.abs();
    const pipe1Transformed = pipe1
      .multiplyBySU2Matrix(u)
      .mulReal(k)
      .makeBReal();
    const pipe2Transformed = pipe2
      .multiplyBySU2Matrix(u)
      .mulReal(k)
      .makeBReal();
    const solutionsTransformed = C2.intersectNormalized(
      pipe1Transformed,
      pipe2Transformed,
      new C2(1.0, 0.0),
    );
    const solutions = solutionsTransformed.map((solutionTransformed) => {
      return solutionTransformed.multiplyBySU2Matrix(uInv).mulReal(k);
    });
    return solutions;
  }

  distanceFromPipe(pipe: C2): number {
    return Math.abs(this.inner(pipe).abs() - 1.0);
  }

  /**
   * Return a matrix U such that Ux ~ (1, 0).
   */
  normalizingSU2Matrix(): C2 {
    const k = 1 / this.abs();
    return new C2(this.a.conj().mulReal(k), this.b.conj().mulReal(k));
  }

  /**
   * Return the inverse of U (see normalizingSU2Matrix).
   */
  normalizingSU2MatrixInv(): C2 {
    const k = 1 / this.abs();
    return new C2(this.a.mulReal(k), this.b.conj().mulReal(-k));
  }

  /**
   * Interpret the vector su = (a,b) in C^2 as a matrix in SU(2) by defining U = [[a b] [-b* a*]],
   * left-multiply by the matrix U.
   */
  multiplyBySU2Matrix(su: C2): C2 {
    return new C2(
      su.a.mul(this.a).add(su.b.mul(this.b)),
      su.b.conj().mulReal(-1).mul(this.a).add(su.a.conj().mul(this.b)),
    );
  }

  isOnPipe(pipe: C2, tolerance: number): boolean {
    return Math.abs(this.inner(pipe).abs() - 1.0) <= tolerance;
  }

  signedDistanceFromPipe(pipe: C2): number {
    return this.inner(pipe).abs() - 1.0;
  }

  similarity(other: C2): number {
    return this.inner(other).abs() / (this.abs() * other.abs());
  }

  toQuaternion(): Quaternion {
    const scale = 1 / this.abs();
    return new Quaternion(
      this.a.real * scale,
      this.a.imag * scale,
      this.b.real * scale,
      this.b.imag * scale
    );
  }

  /**
   * Compute the "inverse Hopf map" of a Vector3, producing a point in C^2. The Hopf map h is a
   * function h : S^3 -> S^2 with the property that x,y are in the same Hopf fiber iff
   * h(x) = h(y). This is a many-to-one function, so its "inverse" h^-1 picks an arbitrary
   * point in the preimage.
   *
   * S^3 is identified with unit vectors in C^2 and S^2 with unit vectors in R^3. The input vector
   * is normalized to be a unit vector, and the output will always be a unit vector.
   *
   * The main use for this is to produce a quaternion that (0, 0, 1) to the input point.
   */
  static inverseHopfMapNormalized(point: Vector3): C2 {
    const pointNormalized = point.clone().normalize();
    if (pointNormalized.x === -1.0) {
      return C2.fromR4(0, 0, 1, 0);
    }
    const denominator = 1 / Math.sqrt(2 * (1 + pointNormalized.x));
    return C2.fromR4(
      (1 + pointNormalized.x) * denominator,
      0,
      -pointNormalized.z * denominator,
      pointNormalized.y * denominator,
    );
  }

  /**
   * Compute the "inverse Hopf map" of a Vector3, producing a point in C^2. The Hopf map h is a
   * function h : S^3 -> S^2 with the property that x,y are in the same Hopf fiber iff
   * h(x) = h(y). This is a many-to-one function, so its "inverse" h^-1 picks an arbitrary
   * point in the preimage.
   *
   * S^3 is identified with unit vectors in C^2 and S^2 with unit vectors in R^3. To handle
   * non-unit vectors, we nest infinitely many Hopf fibrations in each other with
   * h(x) = h(x / ||x||) ||x||.
   *
   * This is the one you want to use for transforming base polyhedra into polytwisters.
   */
  static inverseHopfMapNested(point: Vector3): C2 {
    const length = point.length();
    return C2.inverseHopfMapNormalized(point).mulReal(length);
  }
}

export function getTorusMaxRadius(p1: C2, p2: C2): number {
  // Transform the pair (p1, p2) so that p2 = (1, 0).
  const u = p2.normalizingSU2Matrix();
  const k = 1 / p2.abs();
  const p1n = p1.multiplyBySU2Matrix(u).mulReal(k).makeBReal();
  return Math.sqrt(1 + square((p1n.a.abs() + 1) / p1n.b.abs())) * k;
}

function deduplicateRings(rings: C2[]): C2[] {
  const result: C2[] = [];
  for (let ring of rings) {
    if (result.every((ring2) => ring.similarity(ring2) < 1 - EPSILON)) {
      result.push(ring);
    }
  }
  return result;
}

/**
 * Given an array of rings given by points on C2, compute the cross section
 * at the given w-coordinate, returning a set of points in 3D referred to as
 * "ring dots."
 *
 * A single ring normally produces 0 or 2 dots in the cross section.
 * Theoretically 2 dots can be in the same place, but this is sensitive to
 * floating-point precision.
 *
 * There is one ring that is contained entirely in the w = 0 cross section,
 * given by the implicit equations x^2 + y^2 = 1, w = z = 0. It is not
 * handled here.
 */
export function ringsCrossSection(rings: C2[], w: number): Vector3[] {
  const result: Vector3[] = [];
  for (let ring of rings) {
    for (let dot of ring.fiberCrossSection(w)) {
      result.push(dot);
    }
  }
  return result;
}

/**
 * Given a point y in C^2, a log is an inequality of the form |<x,y>| <= 1 for x in C^2.
 * A ConvexPolytwister is an intersection of finitely many logs. This class does allow degenerate
 * convex polytwisters without rings, such as the intersection of 2 logs.
 */
export class ConvexPolytwister {
  logs: C2[];

  constructor(logs: C2[]) {
    this.logs = logs;
  }

  /**
   * Convert a set of points in R3 to the points defining the pipes of a polytwister by using
   * the inverse Hopf map.
   */
  static fromR3(points: Vector3[]): ConvexPolytwister {
    return new ConvexPolytwister(
      points.map((point) => C2.inverseHopfMapNested(point)),
    );
  }

  get numLogs(): number {
    return this.logs.length;
  }

  /**
   * Take each log point (a,b), rotate its phase so b is a real number, and return
   * the R^3 vector (a.real, a.imag, b.real). This is the format that the fragment
   * shader expects in the "pipes" uniform.
   */
  logsR3(): Vector3[] {
    return this.logs.map((c2) => c2.toVector3W0());
  }

  contains(point: C2, dontCheck: number[]): boolean {
    for (let i = 0; i < this.logs.length; i++) {
      let p = this.logs[i];
      if (dontCheck.indexOf(i) === -1) {
        if (point.signedDistanceFromPipe(p) > EPSILON) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Compute the rings of the polytwister. Rings are the polytwister
   * equivalents of vertices, constituting a finite set of fibers. A simple
   * O(n^3) algorithm is used to compute all the ring positions. The rings are
   * deduplicated so that any two rings that are extremely close to each other
   * are merged. The rings are returned using a set of vectors in C^2, one per
   * ring.
   */
  findRings(): C2[] {
    const result: C2[] = [];
    for (let i1 = 0; i1 < this.logs.length; i1++) {
      for (let i2 = i1 + 1; i2 < this.logs.length; i2++) {
        for (let i3 = i2 + 1; i3 < this.logs.length; i3++) {
          const p1 = this.logs[i1];
          const p2 = this.logs[i2];
          const p3 = this.logs[i3];
          const rings = C2.intersect(p1, p2, p3);
          for (let ring of rings) {
            if (this.contains(ring, [i1, i2, i3])) {
              result.push(ring);
            }
          }
        }
      }
    }
    return deduplicateRings(result);
  }

  /**
   * Get the maximum distance of any point in this polytwister to the origin.
   *
   * This correctly handles non-degenerate polytwisters, and if the polytwister is exactly two logs
   * it will return the maximum fiber radius in the bounding torus. However, it assumes that the set
   * of logs is minimal and does not correctly handle situations such as 3 logs forming a
   * non-meeting triple. This is pure laziness.
   */
  radius() {
    let rings = this.findRings();
    if (rings.length > 0) {
      return Math.max(...rings.map((ring) => ring.abs()));
    }
    if (this.numLogs === 2) {
      return getTorusMaxRadius(this.logs[0], this.logs[1]);
    }
    if (this.numLogs < 2) {
      return Infinity;
    }
    throw new Error("Non-meeting triples not supported");
  }
}

export class Polytwister {
  logs: C2[];
  csg: CSG;

  convexComponents: ConvexPolytwister[];

  constructor(logs: C2[], csg: CSG) {
    this.logs = logs;
    this.csg = csg;

    this.convexComponents = [];
    for (let intersection of this.csg.operands) {
      // Deliberately ignoring antilogs here.
      let convexComponentLogs = intersection.logs.map(
        (logIndex) => this.logs[logIndex],
      );
      let convexComponent = new ConvexPolytwister(convexComponentLogs);
      this.convexComponents.push(convexComponent);
    }
  }

  static fromR3(points: Vector3[], csgDef?: CSG): Polytwister {
    return new Polytwister(
      points.map((point) => C2.inverseHopfMapNested(point)),
      csgDef || csg.convex(points.length),
    );
  }

  static fromDef2(def: PolytwisterDef): Polytwister {
    const polyhedron = symbolToPolyhedron(
      SchlafliSymbol.from(def.symbol)
    );
    const faces = polyhedron.faces;
    const logs: C2[] = [];
    for (let face of faces) {
      logs.push(C2.inverseHopfMapNormalized(face.center));
    }
    return new Polytwister(logs, csg.convex(logs.length));
  }

  get numLogs(): number {
    return this.logs.length;
  }

  /**
   * Take each log point (a,b), rotate its phase so b is a real number, and return
   * the R^3 vector (a.real, a.imag, b.real). This is the format that the fragment
   * shader expects in the "pipes" uniform.
   */
  logsR3(): Vector3[] {
    return this.logs.map((c2) => c2.toVector3W0());
  }

  findRings(): C2[] {
    const rings: C2[] = [];
    for (let component of this.convexComponents) {
      rings.push(...component.findRings());
    }
    return deduplicateRings(rings);
  }

  radius(): number {
    const radii: number[] = [];
    for (let component of this.convexComponents) {
      radii.push(component.radius());
    }
    return Math.max(...radii);
  }

  /**
   * Uniformly scale the polytwister by a factor k. This multiples all the log points by 1 / k since
   * log radii have an inverse relationship to the norm of the log points.
   */
  scale(k: number): Polytwister {
    return new Polytwister(
      this.logs.map((x) => x.mulReal(1 / k)),
      this.csg,
    );
  }

  normalized(): Polytwister {
    const radius = this.radius();
    return this.scale(1 / radius);
  }
}
