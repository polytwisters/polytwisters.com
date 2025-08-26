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
    const angle = (q * 2 * Math.PI) / n;
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
  Both,
}

export interface Region {
  order: number;
  mode: RegionMode;
}

/**
 * Return the filled-in regions for a binary filling, given n, radius index q, rotation number d,
 * and bloatedness.
 */
export function regions(
  n: number,
  q: number,
  d: number,
  bloated: boolean,
): Region[] {
  if (q === Math.ceil(n / 2)) {
    // Create a list of all regions from 0 to n inclusive, outer to inner.
    const allRegions: Region[] = [];
    for (let i = 0; i <= n; i++) {
      allRegions.push({ order: i, mode: RegionMode.Both });
    }

    // List of fundamental arcs. arcs[i] is incident on regions[i] and regions[i + 1].
    const arcs: boolean[] = Array(allRegions.length - 1).fill(false);
    // Turn on the last d arcs for non-bloated case, first d arcs for bloated case.
    for (let i = 0; i < d; i++) {
      arcs[i] = true;
    }
    if (!bloated) {
      arcs.reverse();
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
    const numMainArcs = d < n / 2 ? d : 2 * q + (d - n); // I have no idea how this works.
    // Turn on the last numMainArcs for non-bloated case, first numMainArcs for bloated case.
    for (let i = 0; i < numMainArcs; i++) {
      mainArcs[i] = true;
    }
    if (!bloated) {
      mainArcs.reverse();
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
    const loopArc = d > n / 2;
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
