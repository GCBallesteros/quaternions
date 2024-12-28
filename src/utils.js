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

export function validateName(name, state) {
  const namePattern = /^[a-zA-Z0-9_-]+$/; // Alphanumeric, underscores, and dashes

  if (!namePattern.test(name)) {
    logToOutput(
      `Error: Name '${name}' must be alphanumeric and may contain underscores (_) or dashes (-).`,
    );
    return false;
  }

  if (state.points[name] || state.lines[name]) {
    logToOutput(`Error: Name '${name}' is already in use.`);
    return false;
  }

  return true;
}
