# 🛰️ Quaternion Visualizer 🛰️

## Index
- [Movement & Attitude Commands](#movement--attitude-commands)
  - [rot](#rot)
  - [mov](#mov)
  - [mov2sat](#mov2sat)
  - [frame](#frame)
  - [xyz2geo](#xyz2geo)
  - [geo2xyz](#geo2xyz)
  - [sph2xyz](#sph2xyz)
  - [xyz2sph](#xyz2sph)
- [Geometry Commands](#geometry-commands)
  - [add_point](#add_point)
  - [create_line](#create_line)
  - [list_points](#list_points)
  - [angle](#angle)
- [Utility Commands](#utility-commands)
  - [deg2rad](#deg2rad)
  - [rad2deg](#rad2deg)
  - [fetchTLE](#fetchTLE)

## Movement & Attitude Commands

### rot
**Description**: Applies a quaternion rotation to a named point.

**Arguments**:
- `point_name` (string): The name of the point to rotate.
- `q` (array): A quaternion `[x, y, z, w]` for the rotation.

### mov
**Description**: Moves a named point to a specific latitude, longitude, and altitude.

**Arguments**:
- `point_name` (string): The name of the point to move.
- `lat` (number): Latitude in degrees.
- `long` (number): Longitude in degrees.
- `alt` (number): Altitude in kilometers.

### mov2sat
**Description**: Moves a point to the position of a satellite at a given timestamp.

**Arguments**:
- `name` (string): The name of the point to move.
- `cosparId` (string): COSPAR ID of the satellite.
- `timestamp` (Date): The time for which the position is computed.

### frame
**Description**: Returns the local frame vectors of a point.

**Arguments**:
- `point` (string): The name of the point.

### xyz2geo
**Description**: Converts Cartesian coordinates to geographic coordinates (latitude, longitude, and altitude).

**Arguments**:
- `xyz` (array): Cartesian coordinates `[x, y, z]`.

### geo2xyz
**Description**: Converts geographic coordinates to Cartesian coordinates.

**Arguments**:
- `geo` (array): Geographic coordinates `[latitude, longitude, altitude]`.

### sph2xyz
**Description**: Converts spherical coordinates to Cartesian coordinates.

**Arguments**:
- `sph` (array): Spherical coordinates `[latitude, longitude, radius]`.

### xyz2sph
**Description**: Converts Cartesian coordinates to spherical coordinates.

**Arguments**:
- `xyz` (array): Cartesian coordinates `[x, y, z]`.

## Geometry Commands

### add_point
**Description**: Adds a new point to the scene.

**Arguments**:
- `name` (string): Name of the point.
- `coordinates` (array): Cartesian coordinates `[x, y, z]`.
- `quaternion` (array, optional): Initial rotation as a quaternion `[x, y, z, w]`.

### create_line
**Description**: Creates a line between two points or coordinates.

**Arguments**:
- `name` (string): Name of the line.
- `startArg` (array or string): Starting point or coordinates.
- `endArg` (array or string): Ending point or coordinates.

### list_points
**Description**: Lists all points currently in the state.

**Arguments**: None.

### angle
**Description**: Calculates the angle between two vectors.

**Arguments**:
- `vec1Arg` (array or string): First vector or point reference.
- `vec2Arg` (array or string): Second vector or point reference.

## Utility Commands

### deg2rad
**Description**: Converts degrees to radians.

**Arguments**:
- `x` (number): Angle in degrees.

### rad2deg
**Description**: Converts radians to degrees.

**Arguments**:
- `x` (number): Angle in radians.

### fetchTLE
**Description**: Fetches the Two-Line Element (TLE) for a satellite using its COSPAR ID.

**Arguments**:
- `norad_id` (string): COSPAR ID of the satellite.
