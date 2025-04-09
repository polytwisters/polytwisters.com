import { Vec3 } from "ogl";

export function clamp(x: number, min: number, max: number): number {
  return Math.min(Math.max(x, min), max);
}

export function fromSpherical(
  distance: number,
  azimuth: number,
  elevation: number,
): Vec3 {
  return new Vec3(
    distance * Math.cos(azimuth) * Math.cos(elevation),
    distance * Math.sin(azimuth) * Math.cos(elevation),
    distance * Math.sin(elevation),
  );
}

export function mod(x: number, y: number): number {
  return ((x % y) + y) % y;
}
