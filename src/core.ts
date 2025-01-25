import * as satellite from 'satellite.js';
import { Ok, Err, Result } from 'ts-results';
import * as THREE from 'three';
import {
  createFloatingPoint,
  createFrame,
  createLineGeometry,
} from './components.js';
import { addInitGeometries } from './init.js';
import { log } from './logger.js';
import { OrientedPoint, Point } from './point.js';
import { State, Vector3 } from './types.js';
import * as utils from './utils.js';
import { updateSunLight } from './astronomy.js';

export function _rot(
  state: State,
  point_name: string,
  q: [number, number, number, number],
): Result<null, string> {
  // q is xyzw
  const pt = state.points[point_name];

  if (!pt) {
    return Err(`Point '${point_name}' does not exist.`);
  }

  if (!(pt instanceof OrientedPoint)) {
    return Err(`Only instances of OrientedPoint can be rotated`);
  }

  const quaternion = new THREE.Quaternion(q[0], q[1], q[2], q[3]);
  pt.geometry.setRotationFromQuaternion(quaternion);

  return Ok(null);
}

// Helper function to resolve a vector from various input formats
function resolveVector(
  state: State,
  arg: string | Vector3,
  allowBodyVectors: boolean = false,
): THREE.Vector3 | null {
  if (Array.isArray(arg) && arg.length === 3) {
    return new THREE.Vector3(arg[0], arg[1], arg[2]);
  } else if (typeof arg === 'string') {
    if (allowBodyVectors) {
      switch (arg.toLowerCase()) {
        case 'x':
          return new THREE.Vector3(1, 0, 0);
        case 'y':
          return new THREE.Vector3(0, 1, 0);
        case 'z':
          return new THREE.Vector3(0, 0, 1);
      }
    }

    if (arg.includes('->')) {
      const [startName, endName] = arg.split('->').map((name) => name.trim());
      const startPos = utils.getPositionOfPoint(state, startName);
      const endPos = utils.getPositionOfPoint(state, endName);

      if (!startPos || !endPos) {
        log(`Invalid points in vector definition '${arg}'.`);
        return null;
      }

      return endPos.clone().sub(startPos);
    } else if (state.lines[arg]) {
      const line = state.lines[arg];
      const startPos = utils.getPositionOfPoint(state, line.start);
      const endPos = utils.getPositionOfPoint(state, line.end);

      if (!startPos || !endPos) {
        log(`Invalid line '${arg}' in state.lines.`);
        return null;
      }

      return endPos.clone().sub(startPos);
    }

    log(`Invalid string argument '${arg}'.`);
    return null;
  }

  log(
    allowBodyVectors
      ? "Vector must be an array of 3 values or one of 'x', 'y', 'z'."
      : 'Vector must be an array of 3 values, a line name, or "<start>-><end>".',
  );
  return null;
}

export function _angle(
  state: State,
  vec1Arg: Vector3 | string,
  vec2Arg: Vector3 | string,
): number | null {
  // Resolve both vectors
  const vec1 = resolveVector(state, vec1Arg);
  const vec2 = resolveVector(state, vec2Arg);

  if (!vec1 || !vec2) {
    return null; // If either vector is invalid, return null
  }

  // Calculate the angle
  const dotProduct = vec1.dot(vec2);
  const magnitudeProduct = vec1.length() * vec2.length();

  if (magnitudeProduct === 0) {
    log('Cannot calculate angle with zero-length vector.');
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

export function _mov(
  state: State,
  point_name: string,
  pos: Vector3,
  use_geo: boolean = false,
): void {
  if (!state.points[point_name]) {
    log(`Point '${point_name}' does not exist.`);
    return;
  }
  let point = state.points[point_name];

  let x: number, y: number, z: number;
  if (!use_geo) {
    [x, y, z] = pos;
  } else {
    [x, y, z] = utils.geo2xyz(pos);
  }
  point.position = [x, y, z];
}

export function find_best_quaternion_for_desired_attitude(
  primary_body_vector: Vector3,
  secondary_body_vector: Vector3,
  primary_body_vector_target: Vector3,
  secondary_body_vector_target: Vector3,
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
  state: State,
  primaryVecArg: Vector3 | string,
  secondaryVecArg: Vector3 | string,
  primaryTargetArg: Vector3 | string,
  secondaryTargetArg: Vector3 | string,
): [number, number, number, number] | null {
  // Resolve all arguments
  const primaryBodyVector = resolveVector(state, primaryVecArg, true);
  const secondaryBodyVector = resolveVector(state, secondaryVecArg, true);
  const primaryTargetVector = resolveVector(state, primaryTargetArg, false);
  const secondaryTargetVector = resolveVector(state, secondaryTargetArg, false);

  if (
    !primaryBodyVector ||
    !secondaryBodyVector ||
    !primaryTargetVector ||
    !secondaryTargetVector
  ) {
    log('Invalid inputs. Cannot compute quaternion.');
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

export function _create_line(
  scene: THREE.Scene,
  state: State,
  name: string,
  startArg: Vector3 | string,
  endArg: Vector3 | string,
): void {
  if (!utils.validateName(name, state)) {
    return; // Exit if name validation fails
  }

  if (!name || typeof name !== 'string') {
    log('Invalid line name. It must be a non-empty string.');
    return;
  }

  const startPos = utils.getPositionOfPoint(state, startArg);
  const endPos = utils.getPositionOfPoint(state, endArg);

  if (!startPos || !endPos) {
    log('Invalid points passed to create_line.');
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
  };
}

export function addFrame(point: Point): OrientedPoint {
  const coordinate_frame = createFrame(
    { x: point.position[0], y: point.position[1], z: point.position[2] },
    350,
  );
  let point_geo = point.geometry.clone();
  point_geo.add(coordinate_frame);

  return new OrientedPoint(point_geo);
}

export function _addPoint(
  scene: THREE.Scene,
  state: State,
  name: string,
  coordinates: Vector3,
  quaternion: [number, number, number, number] | null = null,
) {
  if (!utils.validateName(name, state)) {
    return;
  }
  if (!name || !coordinates || coordinates.length !== 3) {
    log(
      "Invalid arguments: 'name' must be a string and 'coordinates' must be an array of 3 numbers.",
    );
    return;
  }

  var new_point: Point | OrientedPoint;
  if (quaternion !== null) {
    if (quaternion.length !== 4) {
      log('Invalid quaternion in addPoint');
      return null;
    } else {
      let new_point_: Point = createFloatingPoint();
      new_point = addFrame(new_point_);
      const q = new THREE.Quaternion(
        quaternion[0],
        quaternion[1],
        quaternion[2],
        quaternion[3],
      ); // xyzw
      new_point.geometry.setRotationFromQuaternion(q);
    }
  } else {
    new_point = createFloatingPoint();
    new_point.geometry.position.set(
      coordinates[0],
      coordinates[1],
      coordinates[2],
    );
  }

  state.points[name] = new_point;
  scene.add(new_point.geometry);
}

export async function _mov2sat(
  state: State,
  name: string,
  cosparId: string,
  timestamp: Date,
): Promise<void> {
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
      log(
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
      point.position = [x, y, z];
      log(`Point ${name} moved to satellite position at ${timestamp}.`);
    } else {
      log(`Point with name '${name}' not found.`);
    }
  } catch (error) {
    if (error instanceof Error) {
      log(`Error fetching or processing satellite data: ${error.message}`);
    } else {
      log(`Error: ${String(error)}`);
    }
  }
}

export async function _fetchTLE(
  state: State,
  norad_id: string,
): Promise<string> {
  // Check if TLE data already exists in the cache
  if (state.tles[norad_id]) {
    log(`Using cached TLE for COSPAR ID:, ${norad_id}`);
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
  log(`Fetched and cached TLE for COSPAR ID: ${norad_id}`);

  return data;
}

export function _setTime(state: State, newTime: Date): void {
  state.currentTime = newTime;
  updateSunLight(state.lights.sun, newTime);
  log(`Simulation time set to: ${newTime.toISOString()}`);
}

export function _reset(
  scene: THREE.Scene,
  state: State,
  switchCamera: (newCamera: THREE.PerspectiveCamera) => void,
): void {
  for (const pointName in state.points) {
    const point = state.points[pointName];
    scene.remove(point.geometry); // Remove from the scene
    delete state.points[pointName]; // Remove from the state
  }

  for (const lineName in state.lines) {
    const line = state.lines[lineName].line;
    scene.remove(line); // Remove from the scene
    delete state.lines[lineName]; // Remove from the state
  }

  addInitGeometries(state, scene);
  switchCamera(state.cameras.main);

  log("Scene has been reset. Only 'sat' and 'nadir' remain.");
}
