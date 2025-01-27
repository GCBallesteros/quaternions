import { toRad, dateToJulian, eci2ecef } from './sun.js';

// Synodic month (new Moon to new Moon)
const SYNODIC_MONTH = 29.53058868;

// Astronomical constants
const EPOCH_1980 = 2444238.5;  // 1980 January 0.0

// Constants for the Moon's orbit, epoch 1980.0
const MOON_MEAN_LONGITUDE_EPOCH = 64.975464;     // Moon's mean longitude at the epoch
const MOON_MEAN_LONGITUDE_PERIGEE = 349.383063;  // Mean longitude of perigee at epoch
const MOON_MEAN_LONGITUDE_NODE = 151.950429;     // Mean longitude of node at epoch
const MOON_INCLINATION = 5.145396;              // Inclination of Moon's orbit
const MOON_ECCENTRICITY = 0.054900;             // Eccentricity of Moon's orbit
const MOON_ANGULAR_SIZE = 0.5181;               // Moon's angular size at distance a
const MOON_SEMI_MAJOR_AXIS = 384401.0;          // Semi-major axis of Moon's orbit in km
const MOON_PARALLAX = 0.9507;                   // Parallax at distance a from Earth

// Constants for the Sun's apparent orbit
const SUN_ECLIPTIC_LONGITUDE_EPOCH = 278.833540;  // Ecliptic longitude of Sun at epoch
const SUN_ECLIPTIC_LONGITUDE_PERIGEE = 282.596403;  // Ecliptic longitude at perigee
const SUN_ORBIT_ECCENTRICITY = 0.016718;          // Eccentricity of Earth's orbit

function fixangle(a: number): number {
  return a - 360.0 * Math.floor(a / 360.0);
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
} {
  // Days since epoch 1980.0
  const jd = dateToJulian(date);
  const daysSince1980 = jd - EPOCH_1980;

  // Calculation of the Sun's position
  const L = fixangle(SUN_ECLIPTIC_LONGITUDE_EPOCH + 0.9856474 * daysSince1980);
  const M = fixangle(L - SUN_ECLIPTIC_LONGITUDE_PERIGEE + 0.033);

  // Calculation of the Moon's position
  const ml = fixangle(13.1763966 * daysSince1980 + MOON_MEAN_LONGITUDE_EPOCH);
  const MM = fixangle(ml - 0.1114041 * daysSince1980 - MOON_MEAN_LONGITUDE_PERIGEE);
  const MN = fixangle(MOON_MEAN_LONGITUDE_NODE - 0.0529539 * daysSince1980);

  // Evection
  const Ev = 1.2739 * Math.sin(toRad(2 * (ml - L) - MM));

  // Annual equation
  const Ae = 0.1858 * Math.sin(toRad(M));

  // Correction term
  const A3 = 0.37 * Math.sin(toRad(M));

  // Corrected anomaly
  const MmP = MM + Ev - Ae - A3;

  // Correction for the equation of the centre
  const mEc = 6.2886 * Math.sin(toRad(MmP));

  // Another correction term
  const A4 = 0.214 * Math.sin(toRad(2 * MmP));

  // Corrected longitude
  const lP = ml + Ev + mEc - Ae + A4;

  // Variation
  const V = 0.6583 * Math.sin(toRad(2 * (lP - L)));

  // True longitude
  const lPP = lP + V;

  // Corrected longitude of the node
  const NP = MN - 0.16 * Math.sin(toRad(M));

  // Calculate the Moon's position in ecliptic coordinates
  const y = Math.sin(toRad(lPP - NP)) * Math.cos(toRad(MOON_INCLINATION));
  const x = Math.cos(toRad(lPP - NP));

  const moonLong = fixangle(Math.atan2(y, x) * 180 / Math.PI + NP);
  const moonLat = Math.asin(
    Math.sin(toRad(lPP - NP)) * Math.sin(toRad(MOON_INCLINATION))
  ) * 180 / Math.PI;

  // Calculate the Moon's distance
  const moonDistance = (MOON_SEMI_MAJOR_AXIS * (1 - MOON_ECCENTRICITY * MOON_ECCENTRICITY)) /
    (1 + MOON_ECCENTRICITY * Math.cos(toRad(MmP + mEc)));

  // Convert to rectangular ECI coordinates
  const xECI = moonDistance * Math.cos(toRad(moonLong)) * Math.cos(toRad(moonLat));
  const yECI = moonDistance * Math.sin(toRad(moonLong)) * Math.cos(toRad(moonLat));
  const zECI = moonDistance * Math.sin(toRad(moonLat));

  const position = eci2ecef([xECI, yECI, zECI], jd);

  // Calculate Moon's angular diameter
  const moonDFrac = moonDistance / MOON_SEMI_MAJOR_AXIS;
  const angularDiameter = MOON_ANGULAR_SIZE / moonDFrac;

  // Calculate Moon's age and phase
  const moonAge = lPP - L;
  const phase = (1 - Math.cos(toRad(moonAge))) / 2;

  console.log(position);
  return {
    position,
    phase: phase,
    age: (SYNODIC_MONTH * fixangle(moonAge)) / 360.0,
    distance: moonDistance,
    angularDiameter: angularDiameter
  };
}
