import * as THREE from 'three';
import { log } from './logger.js';
import { Vector3, State } from './types.js';

const RADIUS_EARTH = 6371.0;

export function getPositionOfPoint(
  state: State,
  pointArg: Vector3 | string,
): THREE.Vector3 | undefined {
  if (Array.isArray(pointArg) && pointArg.length === 3) {
    return new THREE.Vector3(pointArg[0], pointArg[1], pointArg[2]);
  } else if (typeof pointArg === 'string' && state.points[pointArg]) {
    let pos = state.points[pointArg].position;
    return new THREE.Vector3(pos[0], pos[1], pos[2]);
  } else {
    console.error(
      'Invalid point argument. Expected an array of 3 elements or a point name.',
    );
    return undefined;
  }
}

export function validateName(name: string, state: State): boolean {
  const namePattern = /^[a-zA-Z0-9_-]+$/; // Alphanumeric, underscores, and dashes
  const reservedNames = ['Moon', 'Sun'];

  if (!namePattern.test(name)) {
    log(
      `Error: Name '${name}' must be alphanumeric and may contain underscores (_) or dashes (-).`,
    );
    return false;
  }

  if (reservedNames.includes(name)) {
    log(`Error: Name '${name}' is reserved for celestial bodies.`);
    return false;
  }

  if (state.points[name] || state.lines[name]) {
    log(`Error: Name '${name}' is already in use.`);
    return false;
  }

  return true;
}

// Utility Commands

/**
 * Converts spherical coordinates (latitude, longitude, radius) to Cartesian coordinates (x, y, z).
 *
 * @param {Array<number>} sph - An array of three numbers [latitude, longitude, radius], where:
 *  - latitude (degrees): Angle from the equatorial plane, ranges from -90 to 90.
 *  - longitude (degrees): Angle in the xy-plane from the positive x-axis, ranges from -180 to 180.
 *  - radius: The distance from the origin.
 * @returns {Array<number>} An array [x, y, z] representing the Cartesian coordinates.
 * @throws {Error} If the input is invalid.
 */
export function sph2xyz(sph: Vector3): Vector3 {
  if (!Array.isArray(sph) || sph.length !== 3) {
    throw new Error(
      'Input must be an array with three numerical values [latitude, longitude, radius].',
    );
  }

  const [latitude, longitude, radius] = sph;

  const latRad = THREE.MathUtils.degToRad(latitude);
  const lonRad = THREE.MathUtils.degToRad(longitude);

  const x = radius * Math.cos(latRad) * Math.cos(lonRad);
  const y = radius * Math.cos(latRad) * Math.sin(lonRad);
  const z = radius * Math.sin(latRad);

  return [x, y, z];
}

export function geo2xyz(geo: Vector3): Vector3 {
  const [latitude, longitude, altitude] = geo;
  return sph2xyz([latitude, longitude, altitude + RADIUS_EARTH]);
}

/**
 * Converts Cartesian coordinates (x, y, z) to spherical coordinates.
 *
 * @param {Array<number>} point - An array of three numbers representing a point in 3D Cartesian space [x, y, z].
 * @returns {Array<number>} An array [latitude, longitude, radius], where:
 *  - latitude (degrees): Angle from the equatorial plane, ranges from -90 to 90.
 *  - longitude (degrees): Angle in the xy-plane from the positive x-axis, ranges from -180 to 180.
 *  - radius: The distance from the origin to the point.
 * @throws {Error} If the input is invalid or the radius is zero.
 */
export function xyz2sph(point: Vector3): Vector3 {
  if (!Array.isArray(point) || point.length !== 3) {
    throw new Error(
      'Input must be an array with three numerical values [x, y, z].',
    );
  }

  const [x, y, z] = point;

  const radius = Math.sqrt(x * x + y * y + z * z);
  if (radius === 0) {
    throw new Error('Radius cannot be zero.');
  }

  const latitude = 90 - THREE.MathUtils.radToDeg(Math.acos(z / radius));
  const longitude = THREE.MathUtils.radToDeg(Math.atan2(y, x));

  return [latitude, longitude, radius];
}

export function xyz2geo(xyz: Vector3): Vector3 {
  const [latitude, longitude, radius] = xyz2sph(xyz);
  return [latitude, longitude, radius - RADIUS_EARTH];
}
