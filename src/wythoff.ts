import { Vec3 } from "ogl";
import * as mathUtils from "./mathUtils";

/**
 * Given three interior angles of a spherical triangle, return the side length of the side opposite
 * the first angle.
 */
function sphericalTriangleSide(angle1: number, angle2: number, angle3: number): number {
  return Math.acos(
    (Math.cos(angle1) + Math.cos(angle2) * Math.cos(angle3)) /
    (Math.sin(angle2) * Math.sin(angle3))
  )
}

/**
 * Given three interior angles of a spherical triangle, produce three unit vectors realizing that
 * spherical triangle on the unit sphere.
 */
export function makeSphericalTriangle(angle1: number, angle2: number, angle3: number): Vec3[] {
  if (angle1 + angle2 + angle3 < Math.PI) {
    throw new Error("Invalid spherical triangle: angles must sum to 180 degrees or more");
  }
  const point1 = new Vec3(0, 0, 1);
  const side12 = sphericalTriangleSide(angle3, angle1, angle2);
  const side13 = sphericalTriangleSide(angle2, angle1, angle3);
  const point2 = mathUtils.fromSpherical(1, 0, Math.PI / 2 - side12);
  const point3 = mathUtils.fromSpherical(1, angle1, Math.PI / 2 - side13);
  return [point1, point2, point3];
}

/**
 * Given the interior angles of a spherical triangle, produce a set of three vectors which are the
 * normals of the three planes that cut the triangle.
 */
export function makeSphericalTriangleMirrors(angle1: number, angle2: number, angle3: number): Vec3[] {
  const points = makeSphericalTriangle(angle1, angle2, angle3);
  return [
    points[1].clone().cross(points[2]).normalize(),
    points[2].clone().cross(points[0]).normalize(),
    points[0].clone().cross(points[1]).normalize()
  ];
}

const MIN_DISTANCE = 1e-3;

/**
 * Given a Schwarz triangle (n1 n2 n3) with angles pi/n1 pi/n2 pi/n3, start with the point located
 * at the n1 angle and find the orbit of that point.
 */
export function wythoff(n1: number, n2: number, n3: number): Vec3[] {
  const mirrors = makeSphericalTriangleMirrors(Math.PI / n1, Math.PI / n2, Math.PI / n3);
  const stack = [new Vec3(1, 0, 0)];
  const pointsVisited: Vec3[] = [];


  for (let i = 0; i < 200; i++) {
    const point = stack.pop();
    if (!point) {
      break;
    }
    if (pointsVisited.every((x) => x.distance(point) > MIN_DISTANCE)) {
      pointsVisited.push(point);
      for (let mirror of mirrors) {
        const newPoint = mathUtils.reflect(point, mirror);
        stack.push(newPoint);
      }
    }
  }

  return pointsVisited;
}