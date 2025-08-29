import { Vector3 } from "three";
import { PolytwisterDef } from "./polytwisterDefs";
import { Polyhedron, symbolToPolyhedron } from "./wythoff";
import { PolytwisterSymbol } from "./symbol";
import { C2 } from "./complex";
import { square } from "./mathUtils";

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
  bloated: boolean;

  constructor(
    logs: C2[],
    rings: C2[],
    polyhedron: Polyhedron,
    bloated: boolean,
  ) {
    this.logs = logs;
    this.rings = rings;
    this.polyhedron = polyhedron;
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

    // Try to find a twister that is not a digon. 
    const faceIndex = polyhedron.faces.findIndex((face) => face.vertices.length > 2);
    let bloated = false;
    if (faceIndex === -1) {
      // This is a dyadic twister, derive bloatedness from ring figure.
      bloated = symbol.ring.d > symbol.ring.n / 2;
    } else {
      const adjacentFaceIndices = polyhedron.getAdjacentFaceIndices(faceIndex);
      // Intersect the containing pipes of this twister and two adjacent ones that form a ring.
      const tmp = C2.intersect(
        logs[faceIndex], logs[adjacentFaceIndices[0]], logs[adjacentFaceIndices[1]]
      );
      // One of these radii should be 1, the other won't be.
      const radius1 = tmp[0].abs();
      const radius2 = tmp[1].abs();
      if (Math.abs(radius1 - radius2) < 1e-3) {
        throw new Error("Bloatedness test failed");
      }
      let outer = false;
      if (Math.abs(radius1 - 1) < 1e-3) {
        outer = radius2 < 1;
      } else if (Math.abs(radius2 - 1) < 1e-3) {
        outer = radius1 < 1;
      } else {
        throw new Error("This shouldn't happen");
      }
      console.log(outer ? "outer" : "inner");
      const twisterSymbol = polyhedron.faces[faceIndex].symbol;
      bloated = (twisterSymbol.d > twisterSymbol.n / 2) !== outer;
    }

    return new Polytwister(logs, rings, polyhedron, bloated);
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

  /**
   * Uniformly scale the polytwister by a factor k. This multiples all the log points by 1 / k since
   * log radii have an inverse relationship to the norm of the log points.
   */
  scale(k: number): Polytwister {
    return new Polytwister(
      this.logs.map((x) => x.mulReal(1 / k)),
      this.rings.map((x) => x.mulReal(k)),
      this.polyhedron,
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
       */
      tmp.push(`
        vec3 point = Ray_at(ray, t);
        int n = ${n};
        int d = ${d};
        int count = 0;
        float ringRadius = ${this.rings[0].abs()};
        float cutoffRadius = 1.0 / sqrt(square(ringRadius * length(pipes[${twisterIndex}])) - 1.0);
        bool inRing = Pipe_antipode_contains(
          Pipe(pipes[${twisterIndex}] * cutoffRadius, crossSectionW), point
        );
        bool inAnywhere = inRing;
      `);
      for (let adjacentTwisterIndex of adjacentTwisterIndices) {
        tmp.push(`
          if (Pipe_contains(Pipe(pipes[${adjacentTwisterIndex}], crossSectionW), point)) {
            count++;
            inAnywhere = true;
          }
        `);
      }
      if (this.bloated) {
        tmp.push(`
          bool inTwister = (
            (
              d % 2 == 0
                ? count < d && count % 2 == 1
                : count > d || count % 2 == 1
            ) || count == 0
          ) && inAnywhere;
        `);
      } else {
        tmp.push(`
          bool inTwister = (
            (
              (n + 1 - d - count) % 2 == 0
              && count >= n + 1 - d
            ) || count == 0
          ) && inAnywhere;
        `);
      }
      tmp.push(`
        if (inTwister) {
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
}
