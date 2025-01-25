import * as THREE from 'three';

// Obliquity of the ecliptic (Earth's axial tilt) for J2000.0 epoch
const OBLIQUITY = 23.43929111; // degrees
const EPOCH = 2451545.0; // J2000 (2000 January 1.5)
const PI = Math.PI;

export function toRad(deg: number): number {
  return deg * (PI / 180.0);
}

function geomMeanLongSun(t: number): number {
  let l0 = 280.46646 + t * (36000.76983 + 0.0003032 * t);
  return ((l0 % 360.0) + 360.0) % 360.0;
}

function geomMeanAnomalySun(t: number): number {
  return 357.52911 + t * (35999.05029 - 0.0001537 * t);
}

function eccentricityEarthOrbit(t: number): number {
  return 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
}

function sunEquationOfCenter(t: number): number {
  const m = geomMeanAnomalySun(t);
  const mrad = toRad(m);
  const sinm = Math.sin(mrad);
  const sin2m = Math.sin(mrad + mrad);
  const sin3m = Math.sin(mrad + mrad + mrad);

  return (
    sinm * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    sin2m * (0.019993 - 0.000101 * t) +
    sin3m * 0.000289
  );
}

function sunTrueLong(t: number): number {
  const l0 = geomMeanLongSun(t);
  const c = sunEquationOfCenter(t);
  return l0 + c;
}

function sunRadVector(t: number): number {
  const v = geomMeanAnomalySun(t) + sunEquationOfCenter(t);
  const e = eccentricityEarthOrbit(t);
  return (1.000001018 * (1 - e * e)) / (1 + e * Math.cos(toRad(v)));
}

/**
 * Convert a Date object to Julian Date
 * @param date - JavaScript Date object (UTC)
 * @returns Julian Date
 */
export function dateToJulian(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // JavaScript months are 0-based
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const second = date.getUTCSeconds();

  let y = year;
  let m = month;

  // Adjust for January/February
  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);

  const jd =
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    b -
    1524.5 +
    (hour + minute / 60 + second / 3600) / 24;

  return jd;
}

/**
 * Calculate the position of the Sun in ECI coordinates using astral-ts algorithms
 * @param jd - Julian Date for the calculation
 * @returns Position vector [x, y, z] in kilometers
 */
export function getSunPosition(jd: number): [number, number, number] {
  const t = (jd - EPOCH) / 36525.0; // Julian centuries since J2000
  const sunLong = sunTrueLong(t);
  const r = sunRadVector(t) * 149597870.7; // Convert AU to km

  // First get position in ecliptic coordinates
  const xEcliptic = r * Math.cos(toRad(sunLong));
  const yEcliptic = r * Math.sin(toRad(sunLong));
  const zEcliptic = 0;

  // Convert from ecliptic to equatorial coordinates
  const eps = toRad(OBLIQUITY);
  const x = xEcliptic;
  const y = yEcliptic * Math.cos(eps) - zEcliptic * Math.sin(eps);
  const z = yEcliptic * Math.sin(eps) + zEcliptic * Math.cos(eps);

  return [x, y, z];
}

/**
 * Convert ECI coordinates to ECEF coordinates
 * @param eci - Position vector in ECI coordinates [x, y, z]
 * @param jd - Julian Date for the calculation
 * @returns Position vector in ECEF coordinates [x, y, z]
 */
function eci2ecef(
  eci: [number, number, number],
  jd: number,
): [number, number, number] {
  // Calculate GMST (Greenwich Mean Sidereal Time) in radians
  const T = (jd - 2451545.0) / 36525.0; // Julian centuries since J2000
  const gmst =
    (280.46061837 +
      360.98564736629 * (jd - 2451545.0) +
      T * T * (0.000387933 - T / 38710000.0)) %
    360;

  const theta = toRad(gmst);
  const [x, y, z] = eci;

  // Rotate around Z axis by GMST angle
  const xEcef = x * Math.cos(theta) + y * Math.sin(theta);
  const yEcef = -x * Math.sin(theta) + y * Math.cos(theta);
  const zEcef = z;

  return [xEcef, yEcef, zEcef];
}

/**
 * Update the directional light position based on the Sun's position
 * @param light - THREE.DirectionalLight to update
 * @param date - Date for the Sun position calculation
 */
export function updateSunLight(
  light: THREE.DirectionalLight,
  date: Date,
): void {
  const jd = dateToJulian(date);
  const eciPos = getSunPosition(jd);
  const [x, y, z] = eci2ecef(eciPos, jd);

  // Normalize the position for directional light
  const length = Math.sqrt(x * x + y * y + z * z);
  light.position.set(x / length, y / length, z / length);
}
