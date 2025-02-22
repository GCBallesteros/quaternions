import * as THREE from 'three';
import { Err, Ok, Result } from 'ts-results';
import { log } from './logger.js';
import { Array3, State, Vector4 } from './types.js';
import { Vector3 } from './vectors.js';

const RADIUS_EARTH = 6371.0;

export function getPositionOfPoint(
  state: State,
  pointArg: Array3 | string,
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
export function sph2xyz(sph: Array3 | Vector3): Array3 {
  let sph_ = normalizeCoordinates(sph, false);
  if (!Array.isArray(sph_) || sph_.length !== 3) {
    throw new Error(
      'Input must be an array with three numerical values [latitude, longitude, radius].',
    );
  }

  const [latitude, longitude, radius] = sph_;

  const latRad = THREE.MathUtils.degToRad(latitude);
  const lonRad = THREE.MathUtils.degToRad(longitude);

  const x = radius * Math.cos(latRad) * Math.cos(lonRad);
  const y = radius * Math.cos(latRad) * Math.sin(lonRad);
  const z = radius * Math.sin(latRad);

  return [x, y, z];
}

export function geo2xyz(geo: Array3 | Vector3): Array3 {
  let geo_ = normalizeCoordinates(geo, false);
  const [latitude, longitude, altitude] = geo_;
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
export function xyz2sph(point: Array3 | Vector3): Array3 {
  let point_ = normalizeCoordinates(point, false);
  if (!Array.isArray(point_) || point_.length !== 3) {
    throw new Error(
      'Input must be an array with three numerical values [x, y, z].',
    );
  }

  const [x, y, z] = point_;

  const radius = Math.sqrt(x * x + y * y + z * z);
  if (radius === 0) {
    throw new Error('Radius cannot be zero.');
  }

  const latitude = 90 - THREE.MathUtils.radToDeg(Math.acos(z / radius));
  const longitude = THREE.MathUtils.radToDeg(Math.atan2(y, x));

  return [latitude, longitude, radius];
}

export function xyz2geo(xyz: Array3 | Vector3): Array3 {
  const [latitude, longitude, radius] = xyz2sph(xyz);
  return [latitude, longitude, radius - RADIUS_EARTH];
}

/**
 * Creates a Date object using UTC values
 * @param year - Full year (e.g., 2024)
 * @param month - Month (1-12)
 * @param day - Day of month (1-31)
 * @param hours - Hours (0-23), optional
 * @param minutes - Minutes (0-59), optional
 * @param seconds - Seconds (0-59), optional
 * @returns Result containing either a Date object or an error message
 */
export function utcDate(
  year: number,
  month: number,
  day: number,
  hours: number = 0,
  minutes: number = 0,
  seconds: number = 0,
): Result<Date, string> {
  try {
    // Month adjustment since Date expects 0-based months
    const date = new Date(
      Date.UTC(year, month - 1, day, hours, minutes, seconds),
    );

    // Validate the date by checking if the components match what we provided
    // This catches invalid dates like 2024-02-30
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day ||
      date.getUTCHours() !== hours ||
      date.getUTCMinutes() !== minutes ||
      date.getUTCSeconds() !== seconds
    ) {
      return Err('Invalid date components provided');
    }

    return Ok(date);
  } catch (e) {
    return Err(
      `Failed to create date: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
}

/**
 * Recursively disposes of a Three.js object and all its children
 * Handles geometries, materials, and textures
 */
/**
 * Calculates the great circle distance between two points on Earth using the haversine formula.
 * @param lat1 Latitude of first point in degrees
 * @param lon1 Longitude of first point in degrees
 * @param lat2 Latitude of second point in degrees
 * @param lon2 Longitude of second point in degrees
 * @returns Distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  // Convert latitude and longitude from degrees to radians
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  // Haversine formula
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Calculate distance using Earth's radius
  return RADIUS_EARTH * c;
}

export function distance(
  point1: Array3 | Vector3,
  point2: Array3 | Vector3,
): number {
  let point1_ = normalizeCoordinates(point1);
  let point2_ = normalizeCoordinates(point2);
  const dx = point2_[0] - point1_[0];
  const dy = point2_[1] - point1_[1];
  const dz = point2_[2] - point1_[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function disposeObject(object: THREE.Object3D): void {
  while (object.children.length > 0) {
    disposeObject(object.children[0]);
    object.remove(object.children[0]);
  }

  if ((object as any).geometry) {
    (object as any).geometry.dispose();
  }

  if ((object as any).material) {
    if (Array.isArray((object as any).material)) {
      (object as any).material.forEach((material: THREE.Material) => {
        if ((material as any).map) (material as any).map.dispose();
        material.dispose();
      });
    } else {
      if ((object as any).material.map) (object as any).material.map.dispose();
      (object as any).material.dispose();
    }
  }
}

export function normalizeCoordinates(
  x: Array3 | Vector3,
  canBeString?: false,
): Array3;

export function normalizeCoordinates(
  x: Array3 | Vector3 | string,
  canBeString: true,
): Array3 | string;

export function normalizeCoordinates(
  x: Array3 | Vector3 | string,
  canBeString: boolean = false,
): Array3 | string {
  if (canBeString && typeof x === 'string') {
    return x;
  }

  if (Array.isArray(x)) {
    return x;
  } else if (x instanceof Vector3) {
    return x.toArray();
  }

  // This should never happen if types are respected, but we add a fallback.
  throw new Error('Invalid input type');
}

type EulerAngles = { yaw: number; pitch: number; roll: number };

/**
 * Converts ZYX Tait-Bryan angles (yaw, pitch, roll) into a quaternion.
 * @param {EulerAngles} angles - The Euler angles in yaw, pitch, and roll.
 * @param {boolean} [degrees=true] - Whether the input angles are in degrees. If true, they are converted to radians.
 * @returns {Vector4} The resulting quaternion [x, y, z, w].
 */
export function zyxToQuaternion(
  { yaw, pitch, roll }: EulerAngles,
  degrees: boolean = true,
): Vector4 {
  if (degrees) {
    yaw = (yaw * Math.PI) / 180;
    pitch = (pitch * Math.PI) / 180;
    roll = (roll * Math.PI) / 180;
  }

  const cy = Math.cos(yaw * 0.5);
  const sy = Math.sin(yaw * 0.5);
  const cp = Math.cos(pitch * 0.5);
  const sp = Math.sin(pitch * 0.5);
  const cr = Math.cos(roll * 0.5);
  const sr = Math.sin(roll * 0.5);

  return [
    sr * cp * cy - cr * sp * sy, // x
    cr * sp * cy + sr * cp * sy, // y
    cr * cp * sy - sr * sp * cy, // z
    cr * cp * cy + sr * sp * sy, // w
  ];
}
