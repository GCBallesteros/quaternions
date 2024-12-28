import * as THREE from "three";
import { getPositionOfPoint } from "./utils.js";

export function _rot(state, point_name, q) {
  // q is xyzw
  if (!state.points || !state.points[point_name]) {
    console.error(
      `Point with name '${point_name}' does not exist in state.points.`,
    );
    return;
  }

  const pointGroup = state.points[point_name];

  if (!pointGroup) {
    console.error(`Point '${point_name}' does not have a geometryGroup.`);
    return;
  }

  const quaternion = new THREE.Quaternion(q[0], q[2], q[3], q[1]);

  pointGroup.setRotationFromQuaternion(quaternion);
}

export function _angle(state, vec1Arg, vec2Arg) {
  // Helper function to resolve a vector from its argument
  function resolveVector(arg) {
    if (Array.isArray(arg) && arg.length === 3) {
      // Literal vector
      return new THREE.Vector3(arg[0], arg[1], arg[2]);
    } else if (typeof arg === "string") {
      if (arg.includes("->")) {
        // Vector in the form "<start_point_name>-><end_point_name>"
        const [startName, endName] = arg.split("->").map((name) => name.trim());
        const startPos = getPositionOfPoint(state, startName);
        const endPos = getPositionOfPoint(state, endName);

        if (!startPos || !endPos) {
          console.error(`Invalid points in vector definition '${arg}'.`);
          return null;
        }

        return endPos.clone().sub(startPos); // Compute vector
      } else if (state.lines[arg]) {
        // Argument is a line name
        const line = state.lines[arg];
        const startPos = getPositionOfPoint(state, line.start);
        const endPos = getPositionOfPoint(state, line.end);

        if (!startPos || !endPos) {
          console.error(`Invalid line '${arg}' in state.lines.`);
          return null;
        }

        return endPos.clone().sub(startPos); // Compute vector
      } else {
        console.error(`Invalid string argument '${arg}'.`);
        return null;
      }
    } else {
      console.error("Argument must be an array of 3 values or a valid string.");
      return null;
    }
  }

  // Resolve both vectors
  const vec1 = resolveVector(vec1Arg);
  const vec2 = resolveVector(vec2Arg);

  if (!vec1 || !vec2) {
    return null; // If either vector is invalid, return null
  }

  // Calculate the angle
  const dotProduct = vec1.dot(vec2);
  const magnitudeProduct = vec1.length() * vec2.length();

  if (magnitudeProduct === 0) {
    console.error("Cannot calculate angle with zero-length vector.");
    return null;
  }

  const cosineAngle = THREE.MathUtils.clamp(
    dotProduct / magnitudeProduct,
    -1,
    1,
  ); // Clamp to avoid numerical errors
  const angleRadians = Math.acos(cosineAngle);

  return THREE.MathUtils.radToDeg(angleRadians);
}
