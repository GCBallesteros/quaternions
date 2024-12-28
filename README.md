# 🛰️ Quaternion Visualizer 🛰️

A tool for visualizing satellite positions and orientations and providing
simple geometrical calculations. Its main purposes is in debugging
quaternion-based codes for satellites .

This interactive 3D environment allows users to simulate, analyze, and
manipulate satellite data, making it an essential resource for aerospace
engineers, researchers, and enthusiasts.

## Index
- [Default Points and Lines](#default-points-and-lines)
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

### Default Points and Lines

For convenience, the application initializes with the following default
elements:

- **Point**: `"sat"`  
  A point representing a satellite, positioned initially at a predefined location.

- **Line**: `"nadir"`  
  A line connecting the `"sat"` point to the center of the scene, representing the satellite's nadir (the point on Earth directly beneath it).

These defaults are intended to help users quickly visualize basic satellite
positioning and relationships without additional setup.


## Movement & Attitude Commands

### rot
Rotates the point to match the orientation implied by the passed in quaternion.

**Arguments**
- `point_name` (string): The name of the point to rotate.
- `q` (array): A quaternion `[x, y, z, w]` for the rotation.

**Example**
```js
rot("sat", [0, 0, 0, 1]);
```

### mov
Moves a named point to a specific latitude, longitude, and altitude.

**Arguments**
- `point_name` (string): The name of the point to move.
- `lat` (number): Latitude in degrees.
- `long` (number): Longitude in degrees.
- `alt` (number): Altitude in kilometers.

**Example**
```js
mov("satellite1", 45.0, -93.0, 500);
```

### mov2sat
Moves a point to the position of a satellite at a given timestamp.

**Arguments**
- `name` (string): The name of the point to move.
- `cosparId` (string): COSPAR ID of the satellite.
- `timestamp` (Date): The time for which the position is computed.

**Example**
```js
// Move the `sat` point to the current position of the object with
// NORAD catlog number 60562 
mov2sat("sat", "60562", new Date());
```

### frame
**Description**: Returns the local frame vectors of a point.

**Arguments**
- `point` (string): The name of the point.

**Returns**
An object with keys `x`, `y` and `z` corresponding to the basis vector of the frame
expressed in the ECEF coordinate system.

**Example**
```js
// Calculate the angle between the x-axis of the `sat` point and the nadir direction
angle("nadir", frame("sat").x);
```

### xyz2geo
Converts Cartesian coordinates to geographic coordinates (latitude, longitude, and altitude).

**Arguments**
- `xyz` (array): Cartesian coordinates `[x, y, z]`.

**Example**
```js
// Should return lat=0, long=0, altitude=0. Just over NULL Island!
xyz2geo([6371, 0, 0]);
```

**Notes**
- Assumes a spherical Earth.


### geo2xyz
Converts geographic coordinates to Cartesian coordinates.

**Arguments**
- `geo` (array): Geographic coordinates `[latitude, longitude, altitude]`.

**Notes**
- Assumes a spherical Earth.

**Example**
```js
// Opposite of the previous example
geo2xyz([0, 0, 0]);
```

### sph2xyz
Converts spherical coordinates to Cartesian coordinates.

**Arguments**
- `sph` (array): Spherical coordinates `[latitude, longitude, radius]`.

**Notes**
- Assumes a spherical Earth.

### xyz2sph
Converts Cartesian coordinates to spherical coordinates.

**Arguments**
- `xyz` (array): Cartesian coordinates `[x, y, z]`.

**Notes**
- Assumes a spherical Earth.

## Geometry Commands

### add_point
Adds a new point to the scene.

If a quaternion is provided the point will have a basis frame attached to it with
the orientation implied by it.

**Arguments**
- `name` (string): Name of the point.
- `coordinates` (array): Cartesian coordinates `[x, y, z]`.
- `quaternion` (array, optional): Initial rotation as a quaternion `[x, y, z, w]`.


**Example**
```js
// Add a point named `point`` at NULL Island with the same orientation of the
// global ECEF frame.
add_point("point1", [6371, 0, 0], [0, 0, 0, 1]);
```

### create_line
Creates a line between two points or coordinates.

**Arguments**
- `name` (string): Name of the line.
- `startArg` (array or string): Starting point or coordinates.
- `endArg` (array or string): Ending point or coordinates.

### list_points
Lists all points currently in the state.

### angle

Calculates the angle between two vectors.

Arguments  
- `vec1Arg` (string/array)  
  - An array of 3 elements representing the direction of the vector `[x, y, z]`, or  
  - A string in the form `"point1->point2"`, where `point1` and `point2` are the names of existing points, or
  - A string with the name of a line created via `create_line`.
- `vec2Arg` (string/array)  
  - An array of 3 elements representing the direction of the vector `[x, y, z]`, or  
  - A string in the form `"point1->point2"`, where `point1` and `point2` are the names of existing points, or
  - A string with the name of a line created via `create_line`.

Returns the angle in degrees.


## Utility Commands

### deg2rad
Converts degrees to radians.

**Arguments**:
- `x` (number): Angle in degrees.

### rad2deg
Converts radians to degrees.

**Arguments**
- `x` (number): Angle in radians.

### fetchTLE
Fetches the Two-Line Element (TLE) for a satellite using its COSPAR ID.

**Arguments**
- `norad_id` (string): COSPAR ID of the satellite.
