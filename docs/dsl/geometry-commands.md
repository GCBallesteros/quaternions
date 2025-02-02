# Geometry Commands

## addPoint

Adds a new point to the scene. If a quaternion is provided, the point will have
a basis frame attached to it with the orientation implied by the quaternion.

| Parameter     | Type     | Description                                          |
|--------------|----------|------------------------------------------------------|
| `name`       | `string` | Name of the point                                    |
| `coordinates`| `array`  | Cartesian coordinates `[x, y, z]`                    |
| `quaternion` | `array`  | (Optional) Initial rotation as quaternion `[x, y, z, w]` |


**Example**
```js
// Add a point named `point`` at NULL Island with the same orientation of the
// global ECEF frame.
addPoint("point1", [6371, 0, 0], [0, 0, 0, 1]);
```

## createLine

Creates a line between two points or coordinates.

| Parameter  | Type            | Description                           |
|-----------|-----------------|---------------------------------------|
| `name`    | `string`        | Name of the line                      |
| `startArg`| `array\|string` | Starting point or coordinates         |
| `endArg`  | `array\|string` | Ending point or coordinates          |

## deletePoint

Removes a point from the scene.

| Parameter  | Type     | Description                     |
|-----------|----------|---------------------------------|
| `name`    | `string` | Name of the point to delete     |

**Example**
```js
deletePoint("sat"); // Removes the point named "sat" from the scene
```

## listPoints

Lists all points currently present in the scene. 
Takes no arguments.

**Example**
```js
listPoints();
// Output:
// - sat
// - KS
```

## angle

Calculates the angle between two vectors.

| Parameter  | Type            | Description                           |
|-----------|-----------------|---------------------------------------|
| `vec1Arg` | `array\|string` | First vector. See valid input options [here](/dsl/overview/#supplying-vectors-and-positions-by-name-or-value) |
| `vec2Arg` | `array\|string` | Second vector. See valid input options [here](/dsl/overview/#supplying-vectors-and-positions-by-name-or-value) |

Returns the angle in degrees.

## xyz2geo

Converts Cartesian coordinates to geographic coordinates (latitude, longitude,
and altitude).

| Parameter | Type    | Description                     |
|-----------|---------|----------------------------------|
| `xyz`     | `array` | Cartesian coordinates `[x, y, z]` |

**Notes**: Assumes a spherical Earth.

**Example**:
```js
// Should return lat=0, long=0, altitude=0. Just over NULL Island!
xyz2geo([6371, 0, 0]);
```

## geo2xyz

Converts geographic coordinates to Cartesian coordinates.

| Parameter | Type    | Description                                    |
|-----------|---------|------------------------------------------------|
| `geo`     | `array` | Geographic coordinates `[latitude, longitude, altitude]` |

**Notes**: Assumes a spherical Earth.

**Example**:
```js
// Opposite of the previous example
geo2xyz([0, 0, 0]);
```

## sph2xyz

Converts spherical coordinates to Cartesian coordinates.

| Parameter | Type    | Description                                    |
|-----------|---------|------------------------------------------------|
| `sph`     | `array` | Spherical coordinates `[latitude, longitude, radius]` |

**Notes**: Assumes a spherical Earth.

## xyz2sph

Converts Cartesian coordinates to spherical coordinates.

| Parameter | Type    | Description                     |
|-----------|---------|----------------------------------|
| `xyz`     | `array` | Cartesian coordinates `[x, y, z]` |

**Notes**: Assumes a spherical Earth.

