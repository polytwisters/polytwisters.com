import * as camera from "./camera";
import { clamp } from "./mathUtils";

// Sorry about the global variables here.
let pointerDown = false;
let pointerXLast: number | null = null;
let pointerYLast: number | null = null;

// Controls the rate at which camera orbit responds to mouse. Tuned by hand.
const orbitSpeed = 2.0;

export function pointerUp(_e: MouseEvent) {
  pointerDown = false;
}

let canvasScale = 1000;

export function setCanvasScale(value: number) {
  canvasScale = value;
}

export function pointerMove(e: MouseEvent) {
  if (!pointerDown) {
    return;
  }
  // Type guards
  if (pointerXLast === null || pointerYLast === null) {
    return;
  }
  let dx = e.x - pointerXLast;
  let dy = e.y - pointerYLast;

  // Nudge the azimuth according to horizontal mouse movement and nudge the elevation according to
  // the vertical mouse movement. A smarter way to compute the scaling factor would be to use the
  // "arcball" method, but this naive solution still feels fine as far as UX goes.
  camera.setAzimuth(camera.azimuth.value + (-dx / canvasScale) * orbitSpeed);
  camera.setElevation(camera.elevation.value + (dy / canvasScale) * orbitSpeed);

  pointerXLast = e.x;
  pointerYLast = e.y;
}

export function canvasPointerDown(e: MouseEvent) {
  pointerDown = true;
  pointerXLast = e.x;
  pointerYLast = e.y;
}

export function canvasWheel(e: WheelEvent) {
  camera.distance.value = clamp(
    camera.distance.value + e.deltaY / 200,
    1.0,
    20.0,
  );
}

const nudge = (2 * Math.PI) / 50;
const nudgeElevation = (2 * Math.PI) / 50;
const nudgeDistance = 0.15;

export function nudgeLeft() {
  camera.setAzimuth(camera.azimuth.value - nudge);
}

export function nudgeRight() {
  camera.setAzimuth(camera.azimuth.value + nudge);
}

export function nudgeUp() {
  camera.setElevation(camera.elevation.value + nudgeElevation);
}

export function nudgeDown() {
  camera.setElevation(camera.elevation.value - nudgeElevation);
}

export function zoomIn() {
  camera.distance.value = camera.distance.value - nudgeDistance;
}

export function zoomOut() {
  camera.distance.value = camera.distance.value + nudgeDistance;
}

/**
 * Launch document-wide pointer events. Note the use of pointer rather than mouse, so that
 * touchcreen devices are supported.
 */
export function enablePointerEvents() {
  document.addEventListener("pointermove", pointerMove);
  document.addEventListener("pointerup", pointerUp);

  document.addEventListener("keydown", (e) => {
    if (e.shiftKey) {
      if (e.key === "ArrowDown") {
        zoomOut();
      } else if (e.key === "ArrowUp") {
        zoomIn();
      }
    } else {
      if (e.key === "ArrowDown") {
        nudgeDown();
      } else if (e.key === "ArrowUp") {
        nudgeUp();
      } else if (e.key === "ArrowLeft") {
        nudgeLeft();
      } else if (e.key === "ArrowRight") {
        nudgeRight();
      }
    }
  });
}
