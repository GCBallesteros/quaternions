import * as satellite from 'satellite.js';
import * as THREE from 'three';
import { Err, Ok, Result, Some } from 'ts-results';

import { getMoonPosition } from './astronomy/moon.js';
import { updateSunLight } from './astronomy/sun.js';
import {
  createFloatingPoint,
  createFrame,
  createLineGeometry,
} from './components.js';
import { addInitGeometries } from './init.js';
import { log } from './logger.js';
import { cleanupAllPlots, cleanupPlot } from './plots.js';
import { CameraConfig, OrientedPoint } from './points/orientedPoint.js';
import { Point } from './points/point.js';
import { Satellite } from './points/satellite.js';
import { OrientationMode } from './types/orientation.js';
import { Trail } from './trail.js';
import { Array3, State, TleSource } from './types.js';
import { removePointFromUI } from './ui/bodies.js';
import * as utils from './utils.js';

export function _rot(
  state: State,
  point_name: string,
  q: [number, number, number, number],
): Result<null, string> {
  // q is xyzw
  const pt = state.points[point_name];

  if (!(point_name in state.points)) {
    return Err(`Point '${point_name}' does not exist.`);
  }

  if (!(pt instanceof OrientedPoint)) {
    return Err(`Only instances of OrientedPoint can be rotated`);
  }

  const quaternion = new THREE.Quaternion(...q);
  pt.geometry.setRotationFromQuaternion(quaternion);

  return Ok(null);
}

function resolveVector(
  state: State,
  arg: string | Array3,
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

    // Special case for Sun since its position is already the direction vector
    if (arg === 'Sun') {
      return Ok(state.lights.sun.position.clone());
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
    } else if (arg in state.lines) {
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
  vec1Arg: Array3 | string,
  vec2Arg: Array3 | string,
): Result<number, string> {
  // Resolve both vectors
  const vec1Result = resolveVector(state, vec1Arg);
  const vec2Result = resolveVector(state, vec2Arg);

  if (!vec1Result.ok) {
    return Err(vec1Result.val);
  }
  if (!vec2Result.ok) {
    return Err(vec2Result.val);
  }

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
  pos: Array3,
  use_geo: boolean = false,
): Result<null, string> {
  if (!(point_name in state.points)) {
    return Err(`Point '${point_name}' does not exist.`);
  }
  const point = state.points[point_name];

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

function find_best_quaternion_for_desired_attitude(
  primary_body_vector: Array3,
  secondary_body_vector: Array3,
  primary_body_vector_target: Array3,
  secondary_body_vector_target: Array3,
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

export { find_best_quaternion_for_desired_attitude };

export function _findBestQuaternion(
  state: State,
  primaryVecArg: Array3 | string,
  secondaryVecArg: Array3 | string,
  primaryTargetArg: Array3 | string,
  secondaryTargetArg: Array3 | string,
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

  if (!primaryBodyVectorResult.ok) {
    return Err(primaryBodyVectorResult.val);
  }
  if (!secondaryBodyVectorResult.ok) {
    return Err(secondaryBodyVectorResult.val);
  }
  if (!primaryTargetVectorResult.ok) {
    return Err(primaryTargetVectorResult.val);
  }
  if (!secondaryTargetVectorResult.ok) {
    return Err(secondaryTargetVectorResult.val);
  }

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
  startArg: Array3 | string,
  endArg: Array3 | string,
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
    { x: 0, y: 0, z: 0 },
    350,
  );
  const point_geo = point.geometry.clone();
  point_geo.add(coordinate_frame);

  return new OrientedPoint(point_geo);
}

export function _addPoint(
  scene: THREE.Scene,
  state: State,
  name: string,
  coordinates: Array3,
  quaternion: [number, number, number, number],
  relativeTo?: Point | 'Moon',
  color?: string,
  orientationMode?: OrientationMode,
): Result<OrientedPoint, string>;

export function _addPoint(
  scene: THREE.Scene,
  state: State,
  name: string,
  coordinates: Array3,
  quaternion: null,
  relativeTo?: Point | 'Moon',
  color?: string,
): Result<Point, string>;

export function _addPoint(
  scene: THREE.Scene,
  state: State,
  name: string,
  coordinates: Array3,
  quaternion: [number, number, number, number] | null = null,
  relativeTo?: Point | 'Moon',
  color: string = '#ffffff',
  orientationMode?: OrientationMode,
): Result<Point | OrientedPoint, string> {
  if (!utils.validateName(name, state)) {
    return Err('Invalid point name or name already exists');
  }

  if (coordinates.length !== 3) {
    return Err(
      "'name' must be a string and 'coordinates' must be an array of 3 numbers",
    );
  }

  let new_point: Point | OrientedPoint;
  if (quaternion !== null) {
    if (quaternion.length !== 4) {
      return Err('Invalid quaternion: must have exactly 4 components');
    }

    const new_point_: Point = createFloatingPoint(color);
    new_point_.geometry.position.set(
      coordinates[0],
      coordinates[1],
      coordinates[2],
    );
    new_point = addFrame(new_point_);

    // Set initial orientation from quaternion
    const q = new THREE.Quaternion(...quaternion); // xyzw
    new_point.geometry.setRotationFromQuaternion(q);

    // Set orientation mode if provided
    if (orientationMode) {
      (new_point as OrientedPoint).orientationMode = orientationMode;
    }
  } else {
    new_point = createFloatingPoint(color);
    new_point.geometry.position.set(...coordinates);
  }

  state.points[name] = new_point;
  if (relativeTo) {
    if (relativeTo === 'Moon') {
      state.bodies.moon.add(new_point.geometry);
    } else {
      relativeTo.geometry.add(new_point.geometry);
    }
  } else {
    scene.add(new_point.geometry);
  }
  return Ok(new_point);
}

export async function _addSatellite(
  scene: THREE.Scene,
  state: State,
  name: string,
  tleSource: TleSource,
  orientationMode: OrientationMode,
  cameraConfig?: CameraConfig,
): Promise<Result<Satellite, string>> {
  // Satellites don't get passed coordinates because their location is determined
  // by their TLE and the simulation time
  if (!utils.validateName(name, state)) {
    return Err('Invalid point name or name already exists');
  }

  const new_point_: Point = createFloatingPoint();
  const coordinate_frame = createFrame(
    {
      x: new_point_.position[0],
      y: new_point_.position[1],
      z: new_point_.position[2],
    },
    350,
  );
  const point_geo = new_point_.geometry.clone();
  point_geo.add(coordinate_frame);

  let newSatellite: Satellite;
  switch (tleSource.type) {
    case 'tle':
      newSatellite = new Satellite(
        scene,
        point_geo,
        tleSource.tle,
        orientationMode,
        cameraConfig,
      );
      break;

    case 'noradId':
      newSatellite = await Satellite.fromNoradId(
        scene,
        point_geo,
        tleSource.noradId,
        orientationMode,
        cameraConfig,
      );
      break;
  }

  state.points[name] = newSatellite;
  scene.add(newSatellite.geometry);

  // Initialize satellite position immediately
  newSatellite.update(state.currentTime, state);

  return Ok(newSatellite);
}

export async function _mov2sat(
  state: State,
  name: string,
  cosparId: string,
  timestamp: Date,
): Promise<Result<null, string>> {
  // Step 1: Fetch the TLE data using the COSPAR ID
  // Check if TLE data already exists in the cache
  let tle: string;
  if (state.tles[cosparId]) {
    log(`Using cached TLE for COSPAR ID: ${cosparId}`);
    tle = state.tles[cosparId];
  } else {
    const tleResult = await _fetchTLE(cosparId);
    if (!tleResult.ok) {
      return Err(tleResult.val);
    } else {
      tle = tleResult.val;
    }
  }

  // Step 2: Parse the TLE data using satellite.js
  const satrec = satellite.twoline2satrec(
    tle.split('\n')[1],
    tle.split('\n')[2],
  );

  // @ts-ignore: The return type from twoline2satrec is incomplete
  // eslint-disable-next-line
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
  if (!(name in state.points)) {
    return Err(`Point with name '${name}' not found`);
  }

  const point = state.points[name];

  point.position = [x, y, z];
  log(`Point ${name} moved to satellite position at ${timestamp}`);
  return Ok(null);
}

export async function _fetchTLE(
  norad_id: string,
): Promise<Result<string, string>> {
  try {
    const url = `https://celestrak.org/NORAD/elements/gp.php?CATNR=${encodeURIComponent(norad_id)}&FORMAT=3LE`;
    const response = await fetch(url);

    if (!response.ok) {
      return Err(
        `Failed to fetch TLE: ${response.status} - ${response.statusText}`,
      );
    }

    const data = await response.text();

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

  // Update moon position, phase and orientation
  const moonData = getMoonPosition(state.currentTime);
  state.bodies.moon.position.set(...moonData.position);
  (state.bodies.moon as any).phase = moonData.phase;
  state.bodies.moon.setRotationFromQuaternion(
    new THREE.Quaternion(...moonData.orientation),
  );

  // Update all oriented points
  for (const point_name in state.points) {
    const point = state.points[point_name];

    // Update satellites (position and orientation)
    if (point instanceof Satellite) {
      point.update(state.currentTime, state);
    }
    // Update orientation for other oriented points
    else if (point instanceof OrientedPoint && point.orientationMode) {
      point.updateOrientation(state);
    }
  }

  return Ok(null);
}

export function _resumeSimTime(state: State): Result<boolean, string> {
  state.isTimeFlowing = true;
  document
    .querySelector('#time-controls')
    ?.dispatchEvent(new Event('time-state-changed'));
  return Ok(true);
}

export function _pauseSimTime(state: State): Result<boolean, string> {
  state.isTimeFlowing = false;
  document
    .querySelector('#time-controls')
    ?.dispatchEvent(new Event('time-state-changed'));
  return Ok(false);
}

export function _toggleSimTime(state: State): Result<boolean, string> {
  state.isTimeFlowing = !state.isTimeFlowing;
  document
    .querySelector('#time-controls')
    ?.dispatchEvent(new Event('time-state-changed'));
  return Ok(state.isTimeFlowing);
}

export function _deletePoint(
  scene: THREE.Scene,
  state: State,
  pointName: string,
): Result<null, string> {
  if (!(pointName in state.points)) {
    return Err(`Point '${pointName}' does not exist`);
  }
  const point = state.points[pointName];

  if (point instanceof Satellite) {
    point.dispose(scene);
  } else {
    scene.remove(point.geometry);
  }
  delete state.points[pointName];
  removePointFromUI(pointName);

  // Remove any lines that reference this point
  for (const lineName in state.lines) {
    const line = state.lines[lineName];
    if (line.start === pointName || line.end === pointName) {
      scene.remove(line.line);
      delete state.lines[lineName];
    }
  }

  return Ok(null);
}

export function _relativeRot(
  state: State,
  point_name: string,
  q: [number, number, number, number],
): Result<null, string> {
  if (!(point_name in state.points)) {
    return Err(`Point '${point_name}' does not exist.`);
  }

  const pt = state.points[point_name];

  if (!(pt instanceof OrientedPoint)) {
    return Err(`Only instances of OrientedPoint can be rotated`);
  }

  const additionalRotation = new THREE.Quaternion(...q);

  // Get current rotation
  const currentRotation = new THREE.Quaternion();
  pt.geometry.getWorldQuaternion(currentRotation);

  // Multiply quaternions to combine rotations (order matters!)
  const newRotation = currentRotation.multiply(additionalRotation);

  pt.geometry.setRotationFromQuaternion(newRotation);

  return Ok(null);
}

function getSatellite(
  state: State,
  satelliteName: string,
): Result<Satellite, string> {
  if (!(satelliteName in state.points)) {
    return Err(`${satelliteName} is not a valid satellite`);
  }
  const satellite = state.points[satelliteName];

  if (!(satellite instanceof Satellite)) {
    return Err(`${satelliteName} is not a satellite!!!`);
  }
  return Ok(satellite);
}

export function _resumeTrail(
  state: State,
  satelliteName: string,
): Result<boolean, string> {
  const satResult = getSatellite(state, satelliteName);
  if (!satResult.ok) {
    return satResult;
  }
  const satellite = satResult.val;

  if (!satellite.camera) {
    return Err(`${satelliteName} does not have a camera attached`);
  }
  if (!satellite.trail) {
    satellite.trail = new Trail(
      satellite.geometry,
      satellite.geometry.position,
      satellite.geometry.parent as THREE.Scene,
    );
  }
  satellite.hasTrail = true;
  return Ok(true);
}

export function _pauseTrail(
  state: State,
  satelliteName: string,
): Result<boolean, string> {
  const satResult = getSatellite(state, satelliteName);
  if (!satResult.ok) {
    return satResult;
  }
  const satellite = satResult.val;

  if (satellite.trail) {
    satellite.trail.dispose();
    satellite.trail = null;
  }
  satellite.hasTrail = false;
  return Ok(false);
}

export function _toggleTrail(
  state: State,
  satelliteName: string,
): Result<boolean, string> {
  const satResult = getSatellite(state, satelliteName);
  if (!satResult.ok) {
    return satResult;
  }
  return satResult.val.hasTrail
    ? _pauseTrail(state, satelliteName)
    : _resumeTrail(state, satelliteName);
}

export function _createPlot(
  state: State,
  id: string,
  config: { title: string; lines: string[]; sampleEvery?: number },
  callback: () => number[],
): Result<null, string> {
  if (id in state.plots) {
    return Err(`Plot with id '${id}' already exists`);
  }

  state.plots[id] = {
    title: config.title,
    lines: config.lines,
    data: {
      timestamps: new Array<number>(1000).fill(0),
      values: Object.fromEntries(
        config.lines.map((line) => [line, new Array(1000).fill(0)]),
      ),
      maxPoints: 1000,
      currentIndex: 0,
    },
    callback,
    sampleEvery: config.sampleEvery ?? 10,
    lastSample: 0,
    lastSentIndex: 0,
  };

  return Ok(null);
}

// TODO: Check if this enough for proper cleanup
export function _removePlot(state: State, id: string): Result<null, string> {
  if (!(id in state.plots)) {
    return Err(`Plot with id '${id}' does not exist`);
  }

  cleanupPlot(id, state, true);
  return Ok(null);
}

export function _showSecondaryView(
  state: State,
  camera: THREE.PerspectiveCamera,
): Result<null, string> {
  const secondaryView = document.getElementById('secondary-view');
  if (!secondaryView) {
    return Err('Secondary view element not found');
  }
  state.secondaryCamera = Some(camera);
  secondaryView.classList.remove('hidden');
  return Ok(null);
}

export function _hideSecondaryView(): void {
  const secondaryView = document.getElementById('secondary-view');
  if (!secondaryView) {
    throw new Error('Secondary view element not found');
  }
  secondaryView.classList.add('hidden');
}

export function _reset(
  scene: THREE.Scene,
  state: State,
  switchCamera: (newCamera: THREE.PerspectiveCamera) => void,
  cleanupPlots: boolean = false,
): void {
  // Delete all points
  for (const pointName in state.points) {
    _deletePoint(scene, state, pointName);
  }

  if (cleanupPlots) {
    cleanupAllPlots(state);
  }

  addInitGeometries(state, scene);
  switchCamera(state.cameras.main);

  log(
    'Scene has been reset.' + (cleanupPlots ? ' Plots have been cleared.' : ''),
  );
}
