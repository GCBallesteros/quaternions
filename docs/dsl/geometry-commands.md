# Geometry Commands

# AI! I want to write this file using the same style we had for points and movement-and-attitude. That is use tables to explain function arguments and their types. Also provide an
# explanation of what the function does.

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

