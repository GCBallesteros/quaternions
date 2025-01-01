import * as THREE from "three";
import { logToOutput } from "./logger.js";
import {
  getPositionOfPoint,
  validateName,
  xyz2geo,
  xyz2sph,
  geo2xyz,
  sph2xyz,
} from "./utils.js";

export function _rot(state, point_name, q) {
  // q is xyzw
  if (!state.points || !state.points[point_name]) {
    logToOutput(
      `Point with name '${point_name}' does not exist in state.points.`,
    );
    return;
  }

  const pointGroup = state.points[point_name];

  if (!pointGroup) {
    logToOutput(`Point '${point_name}' does not have a geometryGroup.`);
    return;
  }

  const quaternion = new THREE.Quaternion(q[0], q[1], q[2], q[3]);

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
          logToOutput(`Invalid points in vector definition '${arg}'.`);
          return null;
        }

        return endPos.clone().sub(startPos); // Compute vector
      } else if (state.lines[arg]) {
        // Argument is a line name
        const line = state.lines[arg];
        const startPos = getPositionOfPoint(state, line.start);
        const endPos = getPositionOfPoint(state, line.end);

        if (!startPos || !endPos) {
          logToOutput(`Invalid line '${arg}' in state.lines.`);
          return null;
        }

        return endPos.clone().sub(startPos); // Compute vector
      } else {
        logToOutput(`Invalid string argument '${arg}'.`);
        return null;
      }
    } else {
      logToOutput("Argument must be an array of 3 values or a valid string.");
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
    logToOutput("Cannot calculate angle with zero-length vector.");
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

export function _mov(state, point_name, pos, use_geo = false) {
  if (!state.points[point_name]) {
    logToOutput(`Point '${point_name}' does not exist.`);
    return;
  }
  let point = state.points[point_name];

  let x, y, z;
  if (!use_geo) {
    [x, y, z] = pos;
  } else {
    [x, y, z] = geo2xyz(pos);
  }
  point.position.set(x, y, z);
}

export function find_best_quaternion_for_desired_attitude(
  primary_body_vector,
  secondary_body_vector,
  primary_body_vector_target,
  secondary_body_vector_target,
) {
  const primaryVector = new THREE.Vector3(
    primary_body_vector[0],
    primary_body_vector[1],
    primary_body_vector[2],
  ).normalize();

  const primaryTargetVector = new THREE.Vector3(
    primary_body_vector_target[0],
    primary_body_vector_target[1],
    primary_body_vector_target[2],
  ).normalize();

  const secondaryVector = new THREE.Vector3(
    secondary_body_vector[0],
    secondary_body_vector[1],
    secondary_body_vector[2],
  ).normalize();

  const secondaryTargetVector = new THREE.Vector3(
    secondary_body_vector_target[0],
    secondary_body_vector_target[1],
    secondary_body_vector_target[2],
  ).normalize();

  const primaryQuaternion = new THREE.Quaternion().setFromUnitVectors(
    primaryVector,
    primaryTargetVector,
  );

  // Rotate the secondaryVector using the primaryQuaternion
  const rotatedSecondaryVector = secondaryVector
    .clone()
    .applyQuaternion(primaryQuaternion);

  // Project secondary vectors onto the plane orthogonal to primaryTargetVector
  const planeNormal = primaryTargetVector.clone(); // Normal to the plane
  const projectedRotatedSecondary = rotatedSecondaryVector
    .clone()
    .projectOnPlane(planeNormal);
  const projectedTargetSecondary = secondaryTargetVector
    .clone()
    .projectOnPlane(planeNormal);

  // Normalize the projected vectors
  projectedRotatedSecondary.normalize();
  projectedTargetSecondary.normalize();

  // Compute the angle between the projected vectors
  const angle = Math.acos(
    THREE.MathUtils.clamp(
      projectedRotatedSecondary.dot(projectedTargetSecondary),
      -1,
      1,
    ),
  );

  // Determine the rotation direction
  const cross = new THREE.Vector3().crossVectors(
    projectedRotatedSecondary,
    projectedTargetSecondary,
  );
  const direction = cross.dot(primaryTargetVector) < 0 ? -1 : 1;

  // Create a quaternion for the angle-axis rotation
  const angleAxisQuaternion = new THREE.Quaternion().setFromAxisAngle(
    primaryTargetVector,
    direction * angle,
  );

  // Combine the two rotations
  const finalQuaternion = angleAxisQuaternion.multiply(primaryQuaternion);
  const finalQuaternionAsArray = [
    finalQuaternion.x,
    finalQuaternion.y,
    finalQuaternion.z,
    finalQuaternion.w,
  ];

  return finalQuaternionAsArray;
}

find_best_quaternion_for_desired_attitude.help = {
  description:
    "Returns the 3js quaternion that aligns the primary body vector to a given target direction and minimizes the angle to the target given for the secondary body vector.",
  arguments: [
    {
      name: "primary_body_vector",
      type: "array",
      description:
        "A vector as defined on the body frame that we will point. Its target is always perfectly achieved.",
    },
    {
      name: "secondary_body_vector",
      type: "array",
      description:
        "A vector as defined on the body frame that we will make a best effort to align to `secondary_body_vector_target`.",
    },
    {
      name: "primary_body_vector_target",
      type: "array",
      description: "The target direction for the `primary_body_vector`.",
    },
    {
      name: "secondary_body_vector_target",
      type: "array",
      description: "The target direction for the `secondary_body_vector`.",
    },
  ],
};
