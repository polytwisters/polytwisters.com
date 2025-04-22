/**
 * Camera-related refs are stored as global variables in this module. This is not ideal but since
 * there is only one camera it does not cause any particular problems. A more scalable solution
 * would be adopting a state-management library like Pinia.
 */

import { ref, computed } from "vue";
import { fromSpherical, clamp } from "./mathUtils";

// There seem to be two basic types of mouse-controlled cameras, the kind typical of video games and
// the kind used in 3D modeling software. In video games there is always a sense of "up" and you
// have only two degrees of freedom with rotation. In 3D modeling software you can rotate and get
// the full gamut of 3D rotations. The 3D modeling approach is more complicated to program, and on
// top of that symmetrical polytwisters taken at nice cross-sectional angles have a sense of "up."
// I have opted to use the video game approach for now for these reasons.

// Both angles in radians.
export const azimuth = ref(0);
export const elevation = ref(0);
export const distance = ref(0);

export function reset() {
  azimuth.value = Math.PI * 0.2;
  elevation.value = Math.PI * 0.1;
  distance.value = 3.0;
}
reset();

export function setAzimuth(value: number) {
  azimuth.value = value % (2 * Math.PI);
}

export function setElevation(value: number) {
  elevation.value = clamp(value, -Math.PI / 2, Math.PI / 2);
}

export const position = computed(() =>
  fromSpherical(distance.value, azimuth.value, elevation.value),
);

// Vector3 operations are in place, so .clone() is necessary in several operations below.

// Camera is always pointed towards the origin, so the direction vector is just the negative of the
// position vector.
export const direction = computed(() =>
  position.value.clone().multiplyScalar(-1.0).normalize(),
);
// X and Y define the screen space of the camera. They must be orthogonal to each other
// and to Direction.
export const x = computed(() =>
  fromSpherical(1.0, azimuth.value + Math.PI / 2, 0.0),
);
export const y = computed(() =>
  x.value.clone().cross(direction.value).normalize(),
);
// The three vectors above are also passed into Axes.
