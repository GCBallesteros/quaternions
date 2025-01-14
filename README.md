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
  - [point](#point)
  - [find_best_quaternion_for_desired_attitude](#find_best_quaternion_for_desired_attitude)
  - [findBestQuaternion](#findBestQuaternion)
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



### `Point` and `OrientedPoint` Classes

The `Point` and `OrientedPoint` classes represent points in 3D space,
implemented using the `three.js` library.

- **`Point`** is the base class representing a point with a position in 3D
space.  
- **`OrientedPoint`** extends `Point` and adds orientation information using
quaternions. It can also have a camera attached for scene rendering and
perspective control.

Points can be retrieved from the scene via the `point` function (see below).
This classes are seldomly interacted with directly except through the latter
function. When we do retrieve them is mostly to use the getter methods, for
example when we want the basis vector for the reference frame of an
`OrientedPoint`.


### Class: `Point`

The `Point` class provides basic functionality for positioning a point in 3D
space using a `THREE.Group` object.


#### Properties
- **`geometry`** (`THREE.Group`) – The underlying Three.js object that stores the point's position and transformations.

- **`position`** (`Vector3`)  
   - **Getter:** Returns the current position as a tuple `[x, y, z]`.
   - **Setter:** Sets the point's position in 3D space.


### Class: `OrientedPoint` (Subclass of `Point`)
The `OrientedPoint` class extends `Point` and introduces orientation in 3D space using quaternions. It also supports adding a camera to the point.

#### Constructor
```typescript
constructor(geometry: THREE.Group, camera?: THREE.PerspectiveCamera)
```

- **`geometry`**: A `THREE.Group` object representing the point in 3D space.  
- **`camera`** *(optional)*: A `THREE.PerspectiveCamera` to be attached to the
point.

If a camera is provided, it is added to the point's `THREE.Group` and named
`"_camera"` for identification.


#### Properties

- **`frame`** (`{ x: Vector3, y: Vector3, z: Vector3 }`)  Returns the local
coordinate frame vectors (`x`, `y`, `z`) of the point. Each vector is
represented as a tuple `[x, y, z]`.
- **`camera`** (`THREE.Camera | null`)  
   - **Getter:** Returns the first attached camera named `"Camera"` in the point's group or `null` if no such camera exists.


#### Methods
##### `addCamera(fov: number): void`
Adds a `THREE.PerspectiveCamera` with the specified field of view (FOV) to the point's group.  
- Throws an error if a camera with the name `"Camera"` already exists.




### Default Points and Lines

For convenience, the application initializes with the following default
elements:

- **Point**: `"sat"`  
  A point representing a satellite, positioned initially at a predefined location.

- **Line**: `"nadir"`  
  A line connecting the `"sat"` point to the center of the scene, representing the satellite's nadir (the point on Earth directly beneath it).

These defaults are intended to help users quickly visualize basic satellite
positioning and relationships without additional setup.

### State between executions

If you want to store state between script executions please store data within
the globally available object named `ctx`. For example, if you run

```javascrtipt
ctx.foo = 42;
```
and then modify the script `ctx.foo` will still be available;  not so if you
had used a `let` statement.


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
- `pos` (Array): The position interpreted as geographical or cartesian coordinates. See `use_geo`.
- `use_geo` (bool): If true assume `pos` is provided as [lat, long, alt] otherwise as [x, y, z]. Default to false.

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

### point
**Description**: Returns a point in the scene state.

**Arguments**
- `point` (string): The name of the point.

**Returns**
A `Point` or `OrientedPoint` see above.

**Example**
```js
// Calculate the angle between the x-axis of the `sat` point and the nadir direction
angle("nadir", point("sat").frame.x);
```

### find_best_quaternion_for_desired_attitude
**Description**: Returns the 3js quaternion that provided primary and secondary vectors defined on the
body frame of the point finds the quaternion that aligns the primary body vector
to a given target direction and minimizes the angle to the target given for the secondary
body vector.

**Arguments**
-  `primary_body_vector` (array): A vector as defined on the body frame that we will point. It's target is always perfectly achieved.
-  `secondary_body_vector` (array): A vector as defined on the body frame that we will make a best effort to align to `secondary_body_vector_target`.
-  `primary_body_vector_target` (array): The target direction for the `primary_body_vector`.
-  `secondary_body_vector_target` (array):The target direction for the `secondary_body_vector`.


### findBestQuaternion
**Description**: A wrapper around the `find_best_quaternion_for_desired_attitude` function. This function simplifies the process of finding a quaternion by allowing flexible inputs for body vectors and target vectors.

**Arguments**:
- `primaryVecArg` (array or string): The primary body vector. Can be:
  - A 3-element array representing the vector (e.g., `[1, 0, 0]`).
  - One of the strings `"x"`, `"y"`, or `"z"` for canonical basis vectors.
- `secondaryVecArg` (array or string): The secondary body vector. Can be:
  - A 3-element array representing the vector.
  - One of the strings `"x"`, `"y"`, or `"z"`.
- `primaryTargetArg` (array or string): The target vector for the primary body vector. Can be:
  - A 3-element array representing the target vector.
  - A string of the form `"startPoint->endPoint"` to define a vector between two points.
  - A string representing the name of a line in the `state.lines` object.
- `secondaryTargetArg` (array or string): The target vector for the secondary body vector. Can be:
  - A 3-element array representing the target vector.
  - A string of the form `"startPoint->endPoint"` to define a vector between two points.
  - A string representing the name of a line in the `state.lines` object.

**Returns**:
An array with 4 values corresponding to the quaternion in [x,y,z,w] order.

**Example**:
```javascript
const quaternion = findBestQuaternion(
  state,
  "x",
  [0, 1, 0],
  "A->B",
  [0, 0, 1],
);
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

## Example workflow

### Debugging quaternions

```javascript
// Move the default point, `sat`, to somwehere somehwhat near Helsinki
mov("sat", [62.0, 34.0, 500.0], true);
// Calculate ECEF coordinates of point of interest and store them
let ksCoords = geo2xyz([60.186, 24.828, 0]);
// Add a point over the previously calculate coords
add_point("KS", ksCoords);
// Connect "sat" to new point
create_line("sat2KS", "sat", "KS");
// Rotate `sat` to some buggy quaternion
rot("sat", [-0.6313439, -0.1346824, -0.6313439, -0.4297329]);
// Calculate angle between z-axis of `sat` and `sat2KS`
angle("sat2KS", point("sat").frame.z);
```

### Check current position of a satellite

```javascript
// Move the default point, `sat`, to the current position of the object
// with NORAD id 60562
mov2sat("sat", "60562", new Date());
```

### Point nadir with y-axis pointing north

```javascript
// Point the primary direction, (z body vector) nadir and the the secondary
// direction (y body vector) as close as possible as the z axis of the ECEF
// system.
let nadirQuat = findBestQuaternion("z", "y", "nadir", [0,0,1]);
rot("sat", nadirQuat);
```
