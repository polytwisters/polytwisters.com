import { Vector3 } from "three";
import { PolytwisterDef } from "./polytwisterDefs";
import { Polyhedron, symbolToPolyhedron } from "./wythoff";
import { PolytwisterSymbol } from "./symbol";
import { C2 } from "./complex";
import { square } from "./mathUtils";

const EPSILON = 1e-5;

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
  rings: C2[];
  polyhedron: Polyhedron;

  constructor(logs: C2[], rings: C2[], polyhedron: Polyhedron) {
    this.logs = logs;
    this.rings = rings;
    this.polyhedron = polyhedron;
  }

  /**
   * Convert a PolytwisterDef to a Polytwister using the Wythoff construction.
   */
  static fromDef2(def: PolytwisterDef): Polytwister {
    const polyhedron = symbolToPolyhedron(
      PolytwisterSymbol.from(def.symbol)
    );
    const faces = polyhedron.faces;
    const rings = polyhedron.vertexPositions().map((vertex) => C2.inverseHopfMapNormalized(vertex));
    const logs: C2[] = [];
    for (let face of faces) {
      let ring = rings[face.vertices[0]];
      let unscaledLogPoint = C2.inverseHopfMapNormalized(face.center);
      // Find k so that the inner product <ring, unscaledLogPoint * k> = 1.
      let logPoint = unscaledLogPoint.mulReal(1 / ring.inner(unscaledLogPoint).abs());
      logs.push(logPoint);
    }
    return new Polytwister(logs, rings, polyhedron);
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

  radius(): number {
    return 1;
  }

  /**
   * Uniformly scale the polytwister by a factor k. This multiples all the log points by 1 / k since
   * log radii have an inverse relationship to the norm of the log points.
   */
  scale(k: number): Polytwister {
    return new Polytwister(
      this.logs.map((x) => x.mulReal(1 / k)),
      this.rings.map((x) => x.mulReal(k)),
      this.polyhedron
    );
  }

  normalized(): Polytwister {
    const radius = this.radius();
    return this.scale(1 / radius);
  }

  twisterCode(): string {
    const parts = [];
    for (const [twisterIndex, face] of this.polyhedron.faces.entries()) {
      const n = face.vertices.length;

      const tmp = [];
      for (let adjacentTwisterIndex of this.polyhedron.getAdjacentFaceIndices(twisterIndex)) {
        tmp.push(`
          if (Pipe_contains(Pipe(pipes[${adjacentTwisterIndex}], crossSectionW), point)) { count++; }
        `);
      }

      parts.push(`
      {
        int pipeIndex = ${twisterIndex};
        // Test the min point of the interval.
        float t = intervals[pipeIndex].x;
        vec3 point = Ray_at(ray, t);

        int count = 0;
        ${tmp.join("\n")}

        if (count == ${n}) {
          tmin = min(tmin, t);
        }
      }
      `);

      parts.push(`
      {
        int pipeIndex = ${twisterIndex};
        // Test the max point of the interval.
        float t = intervals[pipeIndex].y;
        vec3 point = Ray_at(ray, t);

        int count = 0;
        ${tmp.join("\n")}

        if (count == ${n}) {
          tmin = min(tmin, t);
        }
      }
      `);
    }
    return parts.join("\n");
  }
}
