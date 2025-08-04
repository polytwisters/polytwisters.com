/**
 * In this module, an (n, r) circle configuration is a set of n circles whose centers are positioned
 * at the vertices of a regular n-gon and are all of distance 1 from the origin, and all their radii
 * are r.
 * 
 * If r starts from 0 and increases, the adjacency graph of region classes changes and is assigned
 * an index. Index 0 is a degenerate case where no circles intersect. Index Math.ceil(n / 2) is the
 * case where all circles contain the origin.
 */

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
 * Return the filled-in regions for a binary filling the given n and radius
 * index q, and the given turning number d.
 * Currently it is assumed that d < n / 2, and we're using the "normal" case.
 */
export function regions(n: number, q: number, d: number): Region[] {
  const result = [];
  if (q === Math.ceil(n / 2)) {
    // Monotonic case:
    // - Regions 0 through d are excluded.
    // - d + 1 included.
    // - Regions d + 1, d + 2, d + 3, ... alternate.
    let include = true;
    for (let i = d + 1; i <= n; i++) {
      if (include) {
        result.push({ order: i, mode: RegionMode.Both });
      }
      include = !include;
    }
  } else {
    // - Regions outer(0) through outer(d) are excluded.
    // - outer(d + 1) included.
    // Alternate:
    // - outer(d + 2)
    // - ...
    // - outer(q - 1)
    // - both(q)
    // - inner(q - 1)
    // - ...
    // - inner(0)
    //
    // both(q) and both(q + 1) alternate.
    let include = true;
    for (let i = d + 1; i < q; i++) {
      if (include) {
        result.push({ order: i, mode: RegionMode.Outer });
      }
      include = !include;
    }
    if (include) {
      result.push({ order: q, mode: RegionMode.Both });
    }
    if (!include) {
      result.push({ order: q + 1, mode: RegionMode.Both });
    }
    for (let i = 0; i < q; i++) {
      if (include) {
        result.push({ order: q - 1 - i, mode: RegionMode.Inner });
      }
    }
  }
  return result;
}