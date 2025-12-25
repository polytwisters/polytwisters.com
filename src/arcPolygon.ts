/**
 * In this module, an (n, r) circle configuration is a set of n circles whose
 * centers are positioned at the vertices of a regular n-gon and are all of
 * distance 1 from the origin, and all their radii are r. The circles are
 * numbered C0, C1, C2, ..., C(n-1).
 */

/**
 * Given an (n, r) circle configuration, return the "radius index" which
 * indicates how much the circles overlap. The radius index determines the
 * combinatorial structure of the circle configuration as follows:
 *
 * - If the radius index is Infinity, then the circles all contain the origin.
 * - If the radius index is an integer, then there are tangent circles.
 * - If the radius index is a non-integer, then if we set
 * q = floor(radius index) then circles C0 and Cq intersect at two points, but
 * C0 and Ck do not for all 0 < k < q.
 */
export function getRadiusIndex(n: number, r: number): number {
  if (r >= 1) {
    return Infinity;
  }
  return (n * Math.asin(r)) / Math.PI;
}

const EPSILON = 1e-3;
export function safeFloor(n: number): number {
  return Math.floor(n + EPSILON);
}

export enum RegionMode {
  Inner = "Inner",
  Outer = "Outer",
  Both = "Both",
}

export interface Region {
  order: number;
  mode: RegionMode;
}

/**
 * Compute the binary filling of an arc-polygon. The curve is specified by the
 * following parameters:
 *
 * - n, the number of circles
 * - q, the "radius index" which is Infinity if the circles contain the center
 * of the arc-polygon, and otherwise a finite integer such that circles C0 and
 * Cq intersect but circles C0 and Ck do not overlap for all 0 < k < q
 * - d, the central winding number of the arc-polygon. Note that this is not
 * necessarily the denominator of the twister symbol n/D, as it is always less
 * than n/2. The denominator of the twister symbol n/D can be converted to d
 * with d = D < n/2 ? n - D : d.
 * - verticesOuter: with the above parameters, there are usually two possible
 * sets of vertices. If this boolean is true then pick the outer set, otherwise
 * the inner set.
 * - arcsOuter: with all the above fixed, there are still two possible
 * arc-polygons, one inner and outer. Select the outer one if this is true.
 *
 * The output is in the form of an array of Region objects. Regions come in
 * three types:
 *
 * - { order: k, mode: RegionMode.Both } is all points that are contained inside
 * exactly k circles.
 * - { order: k, mode: RegionMode.Inner } is all points that are contained
 * inside exactly k circles but are close to the origin.
 * - { order: k, mode: RegionMode.Outer } is all points that are contained
 * inside exactly k circles but are far from the origin.
 */
export function regions(
  n: number,
  q: number,
  d: number,
  verticesOuter: boolean,
  arcsOuter: boolean,
): Region[] {
  if (q === Infinity) {
    // Create a list of all regions from [0] to [n] inclusive, outer to inner.
    const allRegions: Region[] = [];
    for (let i = 0; i <= n; i++) {
      allRegions.push({ order: i, mode: RegionMode.Both });
    }

    // List of fundamental arcs. arcs[i] is incident on regions[i] and regions[i + 1].
    const arcs: boolean[] = Array(allRegions.length - 1).fill(false);

    const vertexIndex = verticesOuter ? d : arcs.length - d;
    for (let i = 0; i < arcs.length; i++) {
      arcs[i] = i < vertexIndex === arcsOuter;
    }

    // Color regions excluded = false, included = true.
    // Color regions[0] excluded.
    // Color regions[i] and regions[i + 1] opposite if arcs[i] is true.
    // Color regions[i] and regions[i + 1] the same if arcs[i] is false.
    const regionColors: boolean[] = [];
    regionColors[0] = false;
    for (let i = 1; i < allRegions.length; i++) {
      if (arcs[i - 1] === true) {
        regionColors[i] = !regionColors[i - 1];
      } else {
        regionColors[i] = regionColors[i - 1];
      }
    }

    // Convert the list of colors into actual Region objects.
    const result = [];
    for (let i = 0; i < allRegions.length; i++) {
      if (regionColors[i]) {
        result.push(allRegions[i]);
      }
    }
    return result;
  } else {
    // Create a list of "mainline" regions which looks like this:
    // [0+] [1+] [2+] ... [(q-1)+] [q] [(q-1)-] ... [1-] [0-].
    // There is one more region, [q+1], which is not in this mainline list.
    // The regions are outer to inner.
    // Also note that mainRegions[q] is region [q] -- we'll use that later.
    const mainRegions: Region[] = [];
    for (let i = 0; i < q; i++) {
      mainRegions.push({ order: i, mode: RegionMode.Outer });
    }
    mainRegions.push({ order: q, mode: RegionMode.Both });
    for (let i = 1; i <= q; i++) {
      mainRegions.push({ order: q - i, mode: RegionMode.Inner });
    }

    // List of fundamental arcs. arcs[i] is incident on regions[i] and regions[i + 1].
    // There is one special arc missing, the one joining [q] to [q+1]. We'll handle that later.
    const mainArcs: boolean[] = Array(mainRegions.length - 1).fill(false);
    const vertexIndex = verticesOuter ? d : mainArcs.length - d;
    for (let i = 0; i < mainArcs.length; i++) {
      mainArcs[i] = i < vertexIndex === arcsOuter;
    }

    const mainRegionColors: boolean[] = [];
    // Region [0+] is always excluded.
    mainRegionColors[0] = false;
    for (let i = 1; i < mainRegions.length; i++) {
      if (mainArcs[i - 1]) {
        mainRegionColors[i] = !mainRegionColors[i - 1];
      } else {
        mainRegionColors[i] = mainRegionColors[i - 1];
      }
    }

    // Now for the arc between [q] and [q+1].
    const loopArc = verticesOuter !== arcsOuter;
    const includeLoopRegion = mainRegionColors[q] !== loopArc;

    // Convert the list of colors into actual Region objects.
    const result = [];
    for (let i = 0; i < mainRegions.length; i++) {
      if (mainRegionColors[i]) {
        result.push(mainRegions[i]);
      }
    }
    if (includeLoopRegion) {
      result.push({ order: q + 1, mode: RegionMode.Both });
    }
    return result;
  }
}

export function regionsToString(regions: Region[]): string {
  const sortedRegions = [...regions];
  sortedRegions.sort((region1: Region, region2: Region) => {
    // If both regions are of the form [x], just compare them in reverse order.
    if (region1.mode === RegionMode.Both && region2.mode === RegionMode.Both) {
      return region2.order - region1.order;
    }
    if (
      region1.mode === RegionMode.Inner &&
      region2.mode === RegionMode.Inner
    ) {
      return region1.order - region2.order;
    }
    if (
      region1.mode === RegionMode.Outer &&
      region2.mode === RegionMode.Outer
    ) {
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
  const parts = sortedRegions.map(
    (region: Region) =>
      "[" +
      region.order.toString() +
      (region.mode === RegionMode.Both
        ? ""
        : region.mode === RegionMode.Inner
          ? "-"
          : "+") +
      "]",
  );
  return parts.join(" ");
}
