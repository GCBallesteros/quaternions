// Physical constants
export const RADIUS_EARTH = 6378.137; // Earth radius in kilometers
export const ECC_EARTH = 0.08181919; // Earth's eccentricity (for WGS84)
export const SEMI_MINOR_EARTH_AXIS = Math.sqrt(
  RADIUS_EARTH * RADIUS_EARTH * (1 - ECC_EARTH * ECC_EARTH),
);
