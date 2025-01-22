# Remaining API

- [Geometry Commands](#geometry-commands)
  - [add_point](#add_point)
  - [create_line](#create_line)
  - [list_points](#list_points)
  - [angle](#angle)
- [Utility Commands](#utility-commands)
  - [geo2xyz](#geo2xyz)
  - [sph2xyz](#sph2xyz)
  - [xyz2sph](#xyz2sph)
  - [deg2rad](#deg2rad)
  - [rad2deg](#rad2deg)
  - [fetchTLE](#fetchTLE)



### State between executions

If you want to store state between script executions please store data within
the globally available object named `ctx`. For example, if you run

```javascript
ctx.foo = 42;
```
and then modify the script `ctx.foo` will still be available;  not so if you
had used a `let` statement.


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
