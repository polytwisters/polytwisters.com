import { Vector3 } from "three";
import { PolytwisterDef } from "./polytwisterDefs";
import { Polyhedron, symbolToPolyhedron } from "./wythoff";
import { PolytwisterSymbol } from "./symbol";
import { C2, Complex } from "./complex";
import { square } from "./mathUtils";
import * as arcPolygon from "./arcPolygon";

export function getTorusMaxRadius(p1: C2, p2: C2): number {
  // Transform the pair (p1, p2) so that p2 = (1, 0).
  const u = p2.normalizingSU2Matrix();
  const k = 1 / p2.abs();
  const p1n = p1.multiplyBySU2Matrix(u).mulReal(k).makeBReal();
  return Math.sqrt(1 + square((p1n.a.abs() + 1) / p1n.b.abs())) * k;
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

export class Polytwister {
  logs: C2[];
  rings: C2[];
  polyhedron: Polyhedron;
  outerRings: boolean[];
  bloated: boolean;

  constructor(
    logs: C2[],
    rings: C2[],
    polyhedron: Polyhedron,
    outerRings: boolean[],
    bloated: boolean,
  ) {
    this.logs = logs;
    this.rings = rings;
    this.polyhedron = polyhedron;
    this.outerRings = outerRings;
    this.bloated = bloated;
  }

  /**
   * Convert a PolytwisterDef to a Polytwister using the Wythoff construction.
   */
  static fromDef2(def: PolytwisterDef): Polytwister {
    const symbol: PolytwisterSymbol = def.symbol;
    const polyhedron = symbolToPolyhedron(symbol);
    const faces = polyhedron.faces;
    const rings = polyhedron
      .vertexPositions()
      .map((vertex) => C2.inverseHopfMapNormalized(vertex));
    const logs: C2[] = [];
    for (let face of faces) {
      let ring = rings[face.vertices[0]];
      let unscaledLogPoint = C2.inverseHopfMapNormalized(face.center);
      // Find k so that the inner product |<ring, unscaledLogPoint * k>| = 1.
      let logPoint = unscaledLogPoint.mulReal(
        1 / ring.inner(unscaledLogPoint).abs(),
      );
      logs.push(logPoint);
    }

    const bloated = symbol.isRegular()
      ? symbol.ring.n / symbol.ring.d < 2
      : symbol.ring.n / symbol.ring.d < 1;

    const ringOuter = [];
    for (let orbit = 0; orbit < polyhedron.numFaceOrbits; orbit++) {
      const faceIndex = polyhedron.faces.findIndex(
        (face) => face.orbit === orbit,
      );
      if (faceIndex === -1) {
        throw new Error(
          `This shouldn't happen, no face found with orbit ${orbit}`,
        );
      }
      const outer = Polytwister.computeTwisterRingOrientation(
        polyhedron,
        logs,
        faceIndex,
      );
      ringOuter.push(outer);
    }

    return new Polytwister(logs, rings, polyhedron, ringOuter, bloated);
  }

  /**
   * Given a polyhedron and its logs, assuming its ring radius is 1, return true if the given
   * twister index has rings outer.
   */
  static computeTwisterRingOrientation(
    polyhedron: Polyhedron,
    logs: C2[],
    faceIndex: number,
  ) {
    const adjacentFaceIndices = polyhedron.getAdjacentFaceIndices(faceIndex);
    // Intersect the containing pipes of this twister and two adjacent ones that form a ring.
    const tmp = C2.intersect(
      logs[faceIndex],
      logs[adjacentFaceIndices[0]],
      logs[adjacentFaceIndices[1]],
    );
    if (tmp.length === 0) {
      // In this case the ring orientation does not matter, e.g. tetraretrotetratwister.
      return false;
    }
    const radius1 = tmp[0].abs();
    const radius2 = tmp[1].abs();
    const EPSILON = 1e-5;
    if (Math.abs(radius1 - 1.0) < EPSILON) {
      return radius2 < 1.0;
    }
    if (Math.abs(radius2 - 1.0) < EPSILON) {
      return radius1 < 1.0;
    }
    return false;
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

  /**
   * Return the maximum distance of any point on the polytwister from its center.
   */
  radius(): number {
    if (this.bloated) {
      const log1Index = 0;
      const log2Index = this.polyhedron.getAdjacentFaceIndices(0)[0];
      return getTorusMaxRadius(this.logs[log1Index], this.logs[log2Index]);
    }
    return 1.0;
  }

  ringRadius(): number {
    return this.rings[0].abs();
  }

  /**
   * Uniformly scale the polytwister by a factor k. This multiples all the log points by 1 / k since
   * log radii have an inverse relationship to the norm of the log points.
   */
  scale(k: number): Polytwister {
    return new Polytwister(
      this.logs.map((x) => x.mulReal(1 / k)),
      this.rings.map((x) => x.mulReal(k)),
      this.polyhedron,
      this.outerRings,
      this.bloated,
    );
  }

  /**
   * Uniformly scale the polytwister so that its radius is 1.
   */
  normalized(): Polytwister {
    const radius = this.radius();
    return this.scale(1 / radius);
  }

  /**
   * Given a twister T with containing pipe P(y), find the pipe P(y') so that <y, y'> = 0 and the
   * rings of T are also on P(y'). This orthogonal pipe separates the "inner" from "outer" regions
   * in the filling.
   */
  getOrthogonalPipe(twisterIndex: number): C2 {
    // Suppose y = (a, 0) so y' = (0, k) for real k. The intersection of y and y' comprises rings
    // of constant radius R.
    //
    // R = sqrt(1 + (1 / k)^2) / |a|
    //
    // Solving for unknown k:
    //
    // k = 1 / sqrt((|a| R)^2 - 1)
    //
    // This works in the general case due to symmetry.
    const pipe = this.logs[twisterIndex];
    const tmp = pipe.abs() * this.ringRadius();
    const k = 1 / Math.sqrt(tmp * tmp - 1);
    return pipe.normalizedOrthogonal().mulReal(k);
  }

  getTwisterFilling(twisterIndex: number): arcPolygon.Region[] {
    const n = this.polyhedron.faces[twisterIndex].vertices.length;
    const symbol = this.polyhedron.faces[twisterIndex].symbol;

    const d = symbol.d > n / 2 ? n - symbol.d : symbol.d;

    const adjacentTwisterIndex =
      this.polyhedron.getAdjacentFaceIndices(twisterIndex)[0];
    const log = this.logs[twisterIndex];
    const normalizingTransform = log.normalizingSU2Matrix();
    const k = 1 / log.abs();
    const z = this.logs[adjacentTwisterIndex]
      .multiplyBySU2Matrix(normalizingTransform)
      .mulReal(k)
      .makeBReal();
    const a = z.a;
    const b = z.b.real;
    const radius = 1 / b;
    const circleCenterDistance = a.abs() / b;
    const normalizedRadius = radius / circleCenterDistance;

    const radiusIndex = arcPolygon.getRadiusIndex(n, normalizedRadius);
    const q = arcPolygon.safeFloor(radiusIndex);

    const ringsOuter =
      this.outerRings[this.polyhedron.faces[twisterIndex].orbit];

    const filling = arcPolygon.regions(n, q, d, ringsOuter, this.bloated);
    return filling;
  }

  getTwisterFillingCode(twisterIndex: number): string {
    const regions = this.getTwisterFilling(twisterIndex);
    const parts = [];
    for (let { order, mode } of regions) {
      const tmp = `order == ${order}`;
      if (mode === arcPolygon.RegionMode.Both) {
        parts.push(tmp);
      } else if (mode === arcPolygon.RegionMode.Inner) {
        parts.push(`(${tmp} && inner)`);
      } else if (mode === arcPolygon.RegionMode.Outer) {
        parts.push(`(${tmp} && outer)`);
      }
    }
    return parts.join(" || ");
  }

  twisterCode(): string {
    const parts = [];
    for (const [twisterIndex, face] of this.polyhedron.faces.entries()) {
      const n = face.vertices.length;

      const tmp = [];
      const d = face.symbol.d;
      const adjacentTwisterIndices =
        this.polyhedron.getAdjacentFaceIndices(twisterIndex);

      /**
       * The formula below defines a pipe antipodal to the containing pipe for
       * this twister. If the containing pipe is of the form P(a, 0), the
       * antipodal pipe is P(0, c), and c is set so that the intersection of
       * P(a, 0) and P(0, c) comprises rings of radius r. This is done by
       * solving the equation r = sqrt(1 + (1/c)^2) / |a|.
       *
       * The call to .toFixed ensures the ring always has a decimal point. If it doesn't, GLSL will
       * produce a compile error.
       */
      tmp.push(`
        vec3 point = Ray_at(ray, t);
        int n = ${n};
        int d = ${d};
        float ringRadius = ${this.rings[0].abs().toFixed(10)};
        float cutoffRadius = 1.0 / sqrt(square(ringRadius * length(pipes[${twisterIndex}])) - 1.0);
        bool inner = Pipe_antipode_contains(
          Pipe(pipes[${twisterIndex}] * cutoffRadius, crossSectionW), point
        );
        bool outer = !inner;
        int order = 0;
      `);
      for (let adjacentTwisterIndex of adjacentTwisterIndices) {
        tmp.push(`
          if (Pipe_contains(Pipe(pipes[${adjacentTwisterIndex}], crossSectionW), point)) {
            order++;
          }
        `);
      }

      const fillingCode = this.getTwisterFillingCode(twisterIndex);
      tmp.push(`bool fill = ${fillingCode};`);

      tmp.push(`
        if (fill) {
          tmin = min(tmin, t);
        }
      `);

      parts.push(`
      {
        int pipeIndex = ${twisterIndex};
        // Test the min point of the interval.
        float t = intervals[pipeIndex].x;
        ${tmp.join("\n")}
      }
      `);

      parts.push(`
      {
        int pipeIndex = ${twisterIndex};
        // Test the max point of the interval.
        float t = intervals[pipeIndex].y;
        ${tmp.join("\n")}
      }
      `);
    }
    return parts.join("\n");
  }

  export() {
    return {
      polyhedron: this.polyhedron.export(),
      pipes: this.logs.map((x) => x.toArray()),
      orthogonalPipes: this.logs.map((_, i) => this.getOrthogonalPipe(i).toArray()),
      rings: this.rings.map((x) => x.toArray()),
      outerRings: this.outerRings,
      twisterFillings: Array(this.polyhedron.numFaceOrbits).map((_ignore, i) =>
        this.getTwisterFilling(i),
      ),
    };
  }
}
