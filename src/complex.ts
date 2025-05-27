import { Vector3, Quaternion } from "three";

function square(x: number): number {
  return x * x;
}

export class Complex {
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

