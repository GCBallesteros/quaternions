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
import { updateSunLight } from './astronomy/sun.js';
import { getMoonPosition } from './astronomy/moon.js';

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

function resolveVector(
  state: State,
  arg: string | Vector3,
  allowBodyVectors: boolean = false,
): Result<THREE.Vector3, string> {
  if (Array.isArray(arg) && arg.length === 3) {
    return Ok(new THREE.Vector3(arg[0], arg[1], arg[2]));
  } else if (typeof arg === 'string') {
    if (allowBodyVectors) {
      switch (arg.toLowerCase()) {
        case 'x':
          return Ok(new THREE.Vector3(1, 0, 0));
        case 'y':
          return Ok(new THREE.Vector3(0, 1, 0));
        case 'z':
          return Ok(new THREE.Vector3(0, 0, 1));
      }
    }

    if (arg.includes('->')) {
      const [startName, endName] = arg.split('->').map((name) => name.trim());
      const startPos =
        startName === 'Moon'
          ? state.bodies.moon.position
          : utils.getPositionOfPoint(state, startName);
      const endPos =
        endName === 'Moon'
          ? state.bodies.moon.position
          : utils.getPositionOfPoint(state, endName);

      if (!startPos || !endPos) {
        return Err(`Invalid points in vector definition '${arg}'`);
      } else {
        return Ok(endPos.clone().sub(startPos));
      }
    } else if (state.lines[arg]) {
      const line = state.lines[arg];
      const startPos = utils.getPositionOfPoint(state, line.start);
      const endPos = utils.getPositionOfPoint(state, line.end);

      if (!startPos || !endPos) {
        return Err(`Invalid line '${arg}' in state.lines`);
      }

      return Ok(endPos.clone().sub(startPos));
    }

    return Err(`Invalid string argument '${arg}'`);
  }

  return Err(
    allowBodyVectors
      ? "Vector must be an array of 3 values or one of 'x', 'y', 'z'"
      : 'Vector must be an array of 3 values, a line name, or "<start>-><end>"',
  );
}

export function _angle(
  state: State,
  vec1Arg: Vector3 | string,
  vec2Arg: Vector3 | string,
): Result<number, string> {
  // Resolve both vectors
  const vec1Result = resolveVector(state, vec1Arg);
  const vec2Result = resolveVector(state, vec2Arg);

  if (!vec1Result.ok) return Err(vec1Result.val);
  if (!vec2Result.ok) return Err(vec2Result.val);

  const vec1 = vec1Result.val;
  const vec2 = vec2Result.val;

  // Calculate the angle
  const dotProduct = vec1.dot(vec2);
  const magnitudeProduct = vec1.length() * vec2.length();

  if (magnitudeProduct === 0) {
    return Err('Cannot calculate angle with zero-length vector');
  }

  const cosineAngle = THREE.MathUtils.clamp(
    dotProduct / magnitudeProduct,
    -1,
    1,
  ); // Clamp to avoid numerical errors
  const angleRadians = Math.acos(cosineAngle);

  return Ok(THREE.MathUtils.radToDeg(angleRadians));
}

export function _mov(
  state: State,
  point_name: string,
  pos: Vector3,
  use_geo: boolean = false,
): Result<null, string> {
  if (!state.points[point_name]) {
    return Err(`Point '${point_name}' does not exist.`);
  }
  let point = state.points[point_name];

  if (pos.length !== 3) {
    return Err('Position vector must have exactly 3 components');
  }

  let x: number, y: number, z: number;
  if (!use_geo) {
    [x, y, z] = pos;
  } else {
    [x, y, z] = utils.geo2xyz(pos);
  }
  point.position = [x, y, z];

  return Ok(null);
}

export function find_best_quaternion_for_desired_attitude(
  primary_body_vector: Vector3,
  secondary_body_vector: Vector3,
  primary_body_vector_target: Vector3,
  secondary_body_vector_target: Vector3,
): [number, number, number, number] {
  const [
    primaryVector,
    primaryTargetVector,
    secondaryVector,
    secondaryTargetVector,
  ] = [
    primary_body_vector,
    primary_body_vector_target,
    secondary_body_vector,
    secondary_body_vector_target,
  ].map((vec) => new THREE.Vector3(...vec).normalize());

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
): Result<[number, number, number, number], string> {
  // Resolve all arguments
  const primaryBodyVectorResult = resolveVector(state, primaryVecArg, true);
  const secondaryBodyVectorResult = resolveVector(state, secondaryVecArg, true);
  const primaryTargetVectorResult = resolveVector(
    state,
    primaryTargetArg,
    false,
  );
  const secondaryTargetVectorResult = resolveVector(
    state,
    secondaryTargetArg,
    false,
  );

  if (!primaryBodyVectorResult.ok) return Err(primaryBodyVectorResult.val);
  if (!secondaryBodyVectorResult.ok) return Err(secondaryBodyVectorResult.val);
  if (!primaryTargetVectorResult.ok) return Err(primaryTargetVectorResult.val);
  if (!secondaryTargetVectorResult.ok)
    return Err(secondaryTargetVectorResult.val);

  const primaryBodyVector = primaryBodyVectorResult.val;
  const secondaryBodyVector = secondaryBodyVectorResult.val;
  const primaryTargetVector = primaryTargetVectorResult.val;
  const secondaryTargetVector = secondaryTargetVectorResult.val;

  // Use the underlying function
  const result = find_best_quaternion_for_desired_attitude(
    primaryBodyVector.toArray(),
    secondaryBodyVector.toArray(),
    primaryTargetVector.toArray(),
    secondaryTargetVector.toArray(),
  );

  return Ok(result);
}

export function _createLine(
  scene: THREE.Scene,
  state: State,
  name: string,
  startArg: Vector3 | string,
  endArg: Vector3 | string,
): Result<null, string> {
  if (!utils.validateName(name, state)) {
    return Err('Invalid line name or name already exists');
  }

  if (!name || typeof name !== 'string') {
    return Err('Invalid line name. It must be a non-empty string');
  }

  const startPos = utils.getPositionOfPoint(state, startArg);
  const endPos = utils.getPositionOfPoint(state, endArg);

  if (!startPos || !endPos) {
    return Err('Invalid points provided for line creation');
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

  return Ok(null);
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
): Result<null, string> {
  if (!utils.validateName(name, state)) {
    return Err('Invalid point name or name already exists');
  }

  if (!name || !coordinates || coordinates.length !== 3) {
    return Err(
      "'name' must be a string and 'coordinates' must be an array of 3 numbers",
    );
  }

  var new_point: Point | OrientedPoint;
  if (quaternion !== null) {
    if (quaternion.length !== 4) {
      return Err('Invalid quaternion: must have exactly 4 components');
    }

    let new_point_: Point = createFloatingPoint();
    new_point_.geometry.position.set(
      coordinates[0],
      coordinates[1],
      coordinates[2],
    );
    new_point = addFrame(new_point_);
    const q = new THREE.Quaternion(
      quaternion[0],
      quaternion[1],
      quaternion[2],
      quaternion[3],
    ); // xyzw
    new_point.geometry.setRotationFromQuaternion(q);
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
  return Ok(null);
}

export async function _mov2sat(
  state: State,
  name: string,
  cosparId: string,
  timestamp: Date,
): Promise<Result<null, string>> {
  // Step 1: Fetch the TLE data using the COSPAR ID
  const tleResult = await _fetchTLE(state, cosparId);
  if (!tleResult.ok) {
    return Err(tleResult.val);
  }
  const tle = tleResult.val;

  // Step 2: Parse the TLE data using satellite.js
  const satrec = satellite.twoline2satrec(
    tle.split('\n')[1],
    tle.split('\n')[2],
  );

  if (!satrec) {
    return Err('Failed to parse TLE data');
  }

  // Step 3: Calculate the satellite's position at the given timestamp
  const positionAndVelocity = satellite.propagate(satrec, timestamp);
  const position = positionAndVelocity.position;

  if (typeof position === 'boolean') {
    return Err(
      `No position data found for satellite ${cosparId} at the given timestamp`,
    );
  }

  // Step 4: Convert the position to Earth-centered (X, Y, Z) coordinates
  const gmst = satellite.gstime(timestamp);
  const { x, y, z } = satellite.eciToEcf(position, gmst);

  // Step 5: Update the position of the referenced point in the scene
  const point = state.points[name];
  if (!point) {
    return Err(`Point with name '${name}' not found`);
  }

  point.position = [x, y, z];
  log(`Point ${name} moved to satellite position at ${timestamp}`);
  return Ok(null);
}

export async function _fetchTLE(
  state: State,
  norad_id: string,
): Promise<Result<string, string>> {
  // Check if TLE data already exists in the cache
  if (state.tles[norad_id]) {
    log(`Using cached TLE for COSPAR ID: ${norad_id}`);
    return Ok(state.tles[norad_id]);
  }

  try {
    // If not cached, fetch the TLE data from Celestrak
    const url = `https://celestrak.org/NORAD/elements/gp.php?CATNR=${encodeURIComponent(norad_id)}&FORMAT=3LE`;
    const response = await fetch(url);

    if (!response.ok) {
      return Err(
        `Failed to fetch TLE: ${response.status} - ${response.statusText}`,
      );
    }

    const data = await response.text();

    // Cache the fetched TLE in the state variable under the COSPAR ID
    state.tles[norad_id] = data;
    log(`Fetched and cached TLE for COSPAR ID: ${norad_id}`);

    return Ok(data);
  } catch (error) {
    return Err(
      `Error fetching TLE: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export function _setTime(state: State, newTime: Date): Result<null, string> {
  if (!(newTime instanceof Date)) {
    return Err('Invalid time: must be a Date object');
  }

  state.currentTime = newTime;

  // Update celestial bodies positions
  updateSunLight(state.lights.sun, newTime);
  const moonPos = getMoonPosition(newTime);
  state.bodies.moon.position.set(...moonPos.position);

  log(`Simulation time set to: ${newTime.toISOString()}`);
  return Ok(null);
}

export function _reset(
  scene: THREE.Scene,
  state: State,
  switchCamera: (newCamera: THREE.PerspectiveCamera) => void,
): void {
  for (const pointName in state.points) {
    const point = state.points[pointName];
    scene.remove(point.geometry);
    delete state.points[pointName];
  }

  for (const lineName in state.lines) {
    const line = state.lines[lineName].line;
    scene.remove(line);
    delete state.lines[lineName];
  }

  addInitGeometries(state, scene);
  switchCamera(state.cameras.main);

  log("Scene has been reset. Only 'sat' and 'nadir' remain.");
}
