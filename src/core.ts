import * as satellite from 'satellite.js';
import * as THREE from 'three';
import {
  createFloatingPoint,
  createFrame,
  createLineGeometry,
} from './components.js';
import { logToOutput } from './logger.js';
import { geo2xyz, getPositionOfPoint, validateName } from './utils.js';

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
    } else if (typeof arg === 'string') {
      if (arg.includes('->')) {
        // Vector in the form "<start_point_name>-><end_point_name>"
        const [startName, endName] = arg.split('->').map((name) => name.trim());
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
      logToOutput('Argument must be an array of 3 values or a valid string.');
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
    logToOutput('Cannot calculate angle with zero-length vector.');
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
  primary_body_vector: [number, number, number],
  secondary_body_vector: [number, number, number],
  primary_body_vector_target: [number, number, number],
  secondary_body_vector_target: [number, number, number],
): [number, number, number, number] {
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
  const finalQuaternionAsArray: [number, number, number, number] = [
    finalQuaternion.x,
    finalQuaternion.y,
    finalQuaternion.z,
    finalQuaternion.w,
  ];

  return finalQuaternionAsArray;
}

export function _findBestQuaternion(
  state,
  primaryVecArg: [number, number, number] | string,
  secondaryVecArg: [number, number, number] | string,
  primaryTargetArg: [number, number, number] | string,
  secondaryTargetArg: [number, number, number] | string,
): [number, number, number, number] {
  // Helper function to resolve a vector from its argument
  function resolveBodyVector(arg) {
    if (Array.isArray(arg) && arg.length === 3) {
      return new THREE.Vector3(arg[0], arg[1], arg[2]);
    } else if (typeof arg === 'string') {
      switch (arg.toLowerCase()) {
        case 'x':
          return new THREE.Vector3(1, 0, 0);
        case 'y':
          return new THREE.Vector3(0, 1, 0);
        case 'z':
          return new THREE.Vector3(0, 0, 1);
        default:
          logToOutput(`Invalid body vector argument '${arg}'.`);
          return null;
      }
    } else {
      logToOutput(
        "Body vector must be an array of 3 values or one of 'x', 'y', 'z'.",
      );
      return null;
    }
  }

  // Helper function to resolve a target vector from its argument
  function resolveTargetVector(arg) {
    if (Array.isArray(arg) && arg.length === 3) {
      return new THREE.Vector3(arg[0], arg[1], arg[2]);
    } else if (typeof arg === 'string') {
      if (arg.includes('->')) {
        // Vector in the form "<start_point_name>-><end_point_name>"
        const [startName, endName] = arg.split('->').map((name) => name.trim());
        const startPos = getPositionOfPoint(state, startName);
        const endPos = getPositionOfPoint(state, endName);

        if (!startPos || !endPos) {
          logToOutput(`Invalid points in target vector definition '${arg}'.`);
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
        logToOutput(`Invalid target vector argument '${arg}'.`);
        return null;
      }
    } else {
      logToOutput(
        "Target vector must be an array of 3 values, a line name, or '<start>-><end>'.",
      );
      return null;
    }
  }

  // Resolve all arguments
  const primaryBodyVector = resolveBodyVector(primaryVecArg);
  const secondaryBodyVector = resolveBodyVector(secondaryVecArg);
  const primaryTargetVector = resolveTargetVector(primaryTargetArg);
  const secondaryTargetVector = resolveTargetVector(secondaryTargetArg);

  if (
    !primaryBodyVector ||
    !secondaryBodyVector ||
    !primaryTargetVector ||
    !secondaryTargetVector
  ) {
    logToOutput('Invalid inputs. Cannot compute quaternion.');
    return null;
  }

  // Use the underlying function
  return find_best_quaternion_for_desired_attitude(
    primaryBodyVector.toArray(),
    secondaryBodyVector.toArray(),
    primaryTargetVector.toArray(),
    secondaryTargetVector.toArray(),
  );
}

export function _create_line(scene, state, name, startArg, endArg) {
  if (!validateName(name, state)) {
    return; // Exit if name validation fails
  }

  if (!name || typeof name !== 'string') {
    logToOutput('Invalid line name. It must be a non-empty string.');
    return;
  }

  const startPos = getPositionOfPoint(state, startArg);
  const endPos = getPositionOfPoint(state, endArg);

  if (!startPos || !endPos) {
    logToOutput('Invalid points passed to create_line.');
    return;
  }

  // Create the line geometry
  const geometry = createLineGeometry(startPos, endPos);

  // Create the line material
  const material = new THREE.LineBasicMaterial({
    color: 0x0000ff,
  });

  // Create the line and add it to the scene
  const line = new THREE.Line(geometry, material);
  scene.add(line);

  // Store the line in the state registry
  state.lines[name] = {
    line,
    start: startArg,
    end: endArg,
    geometry,
  };
}

export function addFrame(point) {
  point.add(createFrame(point.position, 400));
}

export function _add_point(scene, state, name, coordinates, quaternion = null) {
  if (!validateName(name, state)) {
    return;
  }
  if (!name || !coordinates || coordinates.length !== 3) {
    logToOutput(
      "Invalid arguments: 'name' must be a string and 'coordinates' must be an array of 3 numbers.",
    );
    return;
  }

  const pointGroup = createFloatingPoint();
  pointGroup.position.set(coordinates[0], coordinates[1], coordinates[2]);

  if (quaternion && quaternion.length === 4) {
    addFrame(pointGroup);
    const q = new THREE.Quaternion(
      quaternion[0],
      quaternion[1],
      quaternion[2],
      quaternion[3],
    ); // xyzw
    pointGroup.setRotationFromQuaternion(q);
  }

  state.points[name] = pointGroup;
  scene.add(pointGroup);
}

export async function _mov2sat(state, name, cosparId, timestamp) {
  try {
    // Step 1: Fetch the TLE data using the COSPAR ID
    const tle = await _fetchTLE(state, cosparId);

    // Step 2: Parse the TLE data using satellite.js
    const satrec = satellite.twoline2satrec(
      tle.split('\n')[1],
      tle.split('\n')[2],
    );

    // Step 3: Calculate the satellite's position at the given timestamp
    const positionAndVelocity = satellite.propagate(satrec, timestamp);
    const position = positionAndVelocity.position;

    if (typeof position === 'boolean') {
      logToOutput(
        `No position data found for satellite ${cosparId} at the given timestamp.`,
      );
      return;
    }

    // Step 4: Convert the position to Earth-centered (X, Y, Z) coordinates
    const gmst = satellite.gstime(timestamp);
    const { x, y, z } = satellite.eciToEcf(position, gmst);

    // Step 5: Update the position of the referenced point in the scene
    const point = state.points[name];
    if (point) {
      point.position.set(x, y, z);
      logToOutput(`Point ${name} moved to satellite position at ${timestamp}.`);
    } else {
      logToOutput(`Point with name '${name}' not found.`);
    }
  } catch (error) {
    logToOutput(
      `Error fetching or processing satellite data: ${error.message}`,
    );
  }
}

export async function _fetchTLE(state, norad_id) {
  // Check if TLE data already exists in the cache
  if (state.tles[norad_id]) {
    console.log('Using cached TLE for COSPAR ID:', norad_id);
    return state.tles[norad_id]; // Return cached TLE
  }

  // If not cached, fetch the TLE data from Celestrak
  const url = `https://celestrak.org/NORAD/elements/gp.php?CATNR=${encodeURIComponent(norad_id)}&FORMAT=3LE`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }

  const data = await response.text();

  // Cache the fetched TLE in the state variable under the COSPAR ID
  state.tles[norad_id] = data;
  console.log('Fetched and cached TLE for COSPAR ID:', norad_id);

  return data;
}

export function _reset(scene, state) {
  // Clear all points except "sat"
  for (const pointName in state.points) {
    if (pointName !== 'sat') {
      const point = state.points[pointName];
      scene.remove(point); // Remove from the scene
      delete state.points[pointName]; // Remove from the state
    }
  }

  // Clear all lines except "nadir"
  for (const lineName in state.lines) {
    if (lineName !== 'nadir') {
      const line = state.lines[lineName].line;
      scene.remove(line); // Remove from the scene
      delete state.lines[lineName]; // Remove from the state
    }
  }

  // Reset the position of "sat"
  _mov(state, 'sat', [39, 0, 500], true); // Move to original position
  _rot(state, 'sat', [0, 0, 0, 1]); // Reset orientation to default quaternion

  logToOutput("Scene has been reset. Only 'sat' and 'nadir' remain.");
}

export function _frame(
  state,
  point: string,
): {
  x: THREE.Vector3Tuple;
  y: THREE.Vector3Tuple;
  z: THREE.Vector3Tuple;
} {
  // Ensure the point exists in the state
  if (!(point in state.points)) {
    console.error('Point not available in the state.');
    return null;
  }

  const pt = state.points[point];

  // Apply the quaternion to the standard basis vectors and return as arrays
  const basisVectors = {
    x: new THREE.Vector3(1, 0, 0).applyQuaternion(pt.quaternion).toArray(),
    y: new THREE.Vector3(0, 1, 0).applyQuaternion(pt.quaternion).toArray(),
    z: new THREE.Vector3(0, 0, 1).applyQuaternion(pt.quaternion).toArray(),
  };

  return basisVectors;
}
