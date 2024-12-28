import * as THREE from "three";

export function getPositionOfPoint(state, pointArg) {
  if (Array.isArray(pointArg) && pointArg.length === 3) {
    return new THREE.Vector3(pointArg[0], pointArg[1], pointArg[2]);
  } else if (typeof pointArg === "string" && state.points[pointArg]) {
    return state.points[pointArg].position;
  } else {
    console.error(
      "Invalid point argument. Expected an array of 3 elements or a point name.",
    );
    return null;
  }
}
