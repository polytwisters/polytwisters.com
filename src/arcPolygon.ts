/**
 * In this module, an (n, r) circle configuration is a set of n circles whose centers are positioned
 * at the vertices of a regular n-gon and are all of distance 1 from the origin, and all their radii
 * are r.
 * 
 * If r starts from 0 and increases, the adjacency graph of region classes changes and is assigned
 * an index. Index 0 is a degenerate case where no circles intersect. Index Math.ceil(n / 2) is the
 * case where all circles contain the origin.
 */

import { sortAndDeduplicateDiagnostics } from "typescript";

/**
 * Return the radii of an (n, r) circle configuration where r crosses a threshold that changes the
 * adjacency graph. These radii are 0, 1, half the edge length, and half the length of every
 * diagonal. There will be Math.ceil(n / 2) + 1 of them.
 */
export function getCriticalRadii(n: number): number[] {
  const result = [];
  for (let q = 0; q < Math.ceil(n / 2); q++) {
    const angle = q * 2 * Math.PI / n;
    const radius = Math.hypot(1 - Math.cos(angle), Math.sin(angle)) / 2;
    result.push(radius);
  }
  result.push(1.0);
  return result;
}

/**
 * Return a radius of (n, r) circle configuration which has index q. Used for testing purposes.
 */
export function getExampleRadius(n: number, q: number): number {
  const criticalRadii = getCriticalRadii(n);
  if (q >= Math.ceil(n / 2)) {
    return 2;
  }
  return (criticalRadii[q] + criticalRadii[q + 1]) / 2;
}

/**
 * Get the index that identifies the graph. Will be between 1 and Math.ceil(n / 2) inclusive.
 */
export function getRadiusIndex(n: number, r: number): number {
  const criticalRadii = getCriticalRadii(n).reverse();
  return criticalRadii.length - 1 - criticalRadii.findIndex((r2) => r > r2);
}

export enum RegionMode {
  Inner,
  Outer,
  Both
}

export interface Region {
  order: number,
  mode: RegionMode
}

/**
 * Return the filled-in regions for a binary filling, given n, radius index q, rotation number d,
 * and bloatedness.
 */
export function regions(n: number, q: number, d: number, bloated: boolean): Region[] {
  const result: Region[] = [];
  if (q === Math.ceil(n / 2)) {
    // Monotonic case. 
  }
  return result;
}

export function regionsToString(regions: Region[]): string {
  const sortedRegions = [...regions];
  sortedRegions.sort((region1: Region, region2: Region) => {
    // If both regions are of the form [x], just compare them in reverse order.
    if (region1.mode === RegionMode.Both && region2.mode === RegionMode.Both) {
      return region2.order - region1.order;
    }
    if (region1.mode === RegionMode.Inner && region2.mode === RegionMode.Inner) {
      return region1.order - region2.order;
    }
    if (region1.mode === RegionMode.Outer && region2.mode === RegionMode.Outer) {
      return region2.order - region1.order;
    }
    if (region1.mode === RegionMode.Inner) {
      return -1;
    }
    if (region1.mode === RegionMode.Outer) {
      return 1;
    }
    if (region2.mode === RegionMode.Inner) {
      return 1;
    }
    if (region2.mode === RegionMode.Outer) {
      return -1;
    }
    return 0;
  });
  const parts = sortedRegions.map((region: Region) => (
    "[" +
    region.order.toString() + (
      region.mode === RegionMode.Both
      ? ""
      : region.mode === RegionMode.Inner
      ? "-"
      : "+"
    )
    + "]"
  ));
  return parts.join(" ");
}