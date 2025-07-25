import { find_best_quaternion_for_desired_attitude } from '../core.js';
import { sph2xyz } from '../utils.js';

import { dateToJulian, eci2ecef, toRad } from './sun.js';

// Synodic month (new Moon to new Moon)
const SYNODIC_MONTH = 29.53058868;

// Astronomical constants
const EPOCH_1980 = 2444238.5; // 1980 January 0.0

// Constants for the Moon's orbit, epoch 1980.0
const MOON_MEAN_LONGITUDE_EPOCH = 64.975464; // Moon's mean longitude at the epoch
const MOON_MEAN_LONGITUDE_PERIGEE = 349.383063; // Mean longitude of perigee at epoch
const MOON_MEAN_LONGITUDE_NODE = 151.950429; // Mean longitude of node at epoch
const MOON_INCLINATION = 5.145396; // Inclination of Moon's orbit
const MOON_ECCENTRICITY = 0.0549; // Eccentricity of Moon's orbit
const MOON_ANGULAR_SIZE = 0.5181; // Moon's angular size at distance a
const MOON_SEMI_MAJOR_AXIS = 384401.0; // Semi-major axis of Moon's orbit in km
// const MOON_PARALLAX = 0.9507; // Parallax at distance a from Earth

// Constants for the Sun's apparent orbit
const SUN_ECLIPTIC_LONGITUDE_EPOCH = 278.83354; // Ecliptic longitude of Sun at epoch
const SUN_ECLIPTIC_LONGITUDE_PERIGEE = 282.596403; // Ecliptic longitude at perigee
// const SUN_ORBIT_ECCENTRICITY = 0.016718; // Eccentricity of Earth's orbit

function fixangle(a: number): number {
  return a - 360.0 * Math.floor(a / 360.0);
}

// Solve Kepler's equation (returns E in radians)
function kepler(m: number, ecc: number): number {
    const EPSILON = 1e-6;
    let e = toRad(m);  // initial guess
    let delta: number;

    do {
        delta = e - ecc * Math.sin(e) - toRad(m);
        e = e - delta / (1 - ecc * Math.cos(e));
    } while (Math.abs(delta) > EPSILON);

    return e;
}

const ECCENT = 0.016718 // Eccentricity of Earth's orbit
const ELONGP = 282.596403  // Ecliptic longitude of the Sun at perigee
const ELONGE = 278.833540 //* Ecliptic longitude of the Sun at epoch 1980.0

// Compute Lambdasun
function computeLambdasun(M: number, eccent: number, elongp: number): number {
    // Solve Kepler's equation (E is in radians)
    const E = kepler(M, eccent);

    // True anomaly
    let Ec = Math.sqrt((1 + eccent) / (1 - eccent)) * Math.tan(E / 2);
    Ec = 2 * (Math.atan(Ec))*(180/Math.PI);

    // Sun's geocentric ecliptic longitude
    const Lambdasun = fixangle(Ec + ELONGP);

    return Lambdasun;
}

/**
 * Calculate Moon's position and phase
 * @param date - JavaScript Date object (UTC)
 * @returns Position vector [x, y, z] in kilometers and phase information
 */

export function getMoonPosition(date: Date): {
  position: [number, number, number];
  phase: number;
  age: number;
  distance: number;
  angularDiameter: number;
  orientation: [number, number, number, number];
} {
  // Days since epoch 1980.0
  const jd = dateToJulian(date);
  const daysSince1980 = jd - EPOCH_1980;

  // Calculation of the Sun's position
  const N = fixangle((360 / 365.2422) * daysSince1980);   /* Mean anomaly of the Sun */
  const M = fixangle(N + ELONGE - ELONGP);
  const lambdasun = computeLambdasun(M, ECCENT, ELONGP)

  // Calculation of the Moon's position
  const ml = fixangle(13.1763966 * daysSince1980 + MOON_MEAN_LONGITUDE_EPOCH); //ok
  const MM = fixangle(
    ml - 0.1114041 * daysSince1980 - MOON_MEAN_LONGITUDE_PERIGEE,
  ); // ok
  const MN = fixangle(MOON_MEAN_LONGITUDE_NODE - 0.0529539 * daysSince1980);  //ok

  // Evection
  const Ev = 1.2739 * Math.sin(toRad(2 * (ml - lambdasun) - MM)); // ok

  // Annual equation
  const Ae = 0.1858 * Math.sin(toRad(M)); // ok

  // Correction term
  const A3 = 0.37 * Math.sin(toRad(M)); // ok

  // Corrected anomaly
  const MmP = MM + Ev - Ae - A3;  // ok

  // Correction for the equation of the centre
  const mEc = 6.2886 * Math.sin(toRad(MmP));

  // Another correction term
  const A4 = 0.214 * Math.sin(toRad(2 * MmP));

  // Corrected longitude
  const lP = ml + Ev + mEc - Ae + A4;

  // Variation
  const V = 0.6583 * Math.sin(toRad(2 * (lP - lambdasun)));

  // True longitude
  const lPP = lP + V;

  // Corrected longitude of the node
  const NP = MN - 0.16 * Math.sin(toRad(M));  // ok

  // Calculate the Moon's position in ecliptic coordinates
  const y = Math.sin(toRad(lPP - NP)) * Math.cos(toRad(MOON_INCLINATION));
  const x = Math.cos(toRad(lPP - NP));

  const moonLong = (Math.atan2(y, x) * 180) / Math.PI + NP;
  const moonLat =
    (Math.asin(Math.sin(toRad(lPP - NP)) * Math.sin(toRad(MOON_INCLINATION))) *
      180) /
    Math.PI;


  // Calculate the Moon's distance
  const moonDistance =
    (MOON_SEMI_MAJOR_AXIS * (1 - MOON_ECCENTRICITY * MOON_ECCENTRICITY)) /
    (1 + MOON_ECCENTRICITY * Math.cos(toRad(MmP + mEc)));

  // Convert to rectangular ECI coordinates
  const xECI =
    moonDistance * Math.cos(toRad(moonLong)) * Math.cos(toRad(moonLat));
  const yECI =
    moonDistance * Math.sin(toRad(moonLong)) * Math.cos(toRad(moonLat));
  const zECI = moonDistance * Math.sin(toRad(moonLong));

  //console.log([xECI, yECI, zECI])
  const position = eci2ecef([xECI, yECI, zECI], jd);

  // Calculate Moon's angular diameter
  const moonDFrac = moonDistance / MOON_SEMI_MAJOR_AXIS;
  const angularDiameter = MOON_ANGULAR_SIZE / moonDFrac;

  // Calculate Moon's age and phase
  const moonAge = lPP - lambdasun;
  //const phase = (1 - Math.cos(toRad(moonAge))) / 2;

  // Convert moonAge + 180 to range [-180, 180]
  const normalizedPhase = ((moonAge + 180 + 180) % 360) - 180;

  // Calculate Moon's orientation
  // We define a point on the Moon's surface (in its body frame) that should always face Earth
  // NOTE: Point is chosen arbitrarily to sort of look like picture of the Moon
  // no particular rigor there
  const moonFacePoint: [number, number, number] = sph2xyz([45, 0, 1738]);

  // The Earth-to-Moon vector (normalized)
  const earthToMoon: [number, number, number] = [
    position[0],
    position[1],
    position[2],
  ];

  // Find quaternion to align Moon's face with Earth
  const moonOrientation = find_best_quaternion_for_desired_attitude(
    moonFacePoint, // Primary body vector (Moon's face direction)
    [0, 0, 1], // Secondary body vector (Moon's "up" direction)
    earthToMoon, // Primary target vector (Earth direction)
    [0, 0, 1], // Secondary target vector (try to keep Moon's north aligned with Earth's)
  );

  return {
    position,
    phase: normalizedPhase,
    age: (SYNODIC_MONTH * fixangle(moonAge)) / 360.0,
    distance: moonDistance,
    angularDiameter: angularDiameter,
    orientation: moonOrientation,
  };
}
