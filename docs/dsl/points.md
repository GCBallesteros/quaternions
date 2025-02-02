# Point Classes


The `Point` and `OrientedPoint` classes represent points in 3D space,
implemented using the `three.js` library.

- **`Point`** is the base class representing a point with a position in 3D
space.  

- **`OrientedPoint`** extends `Point` and adds orientation information using
quaternions. It can also have a camera attached for scene rendering and
perspective control.

Points can be retrieved from the scene via the `point` function (see below).
These classes are seldomly interacted with directly except through the latter
function. When we do retrieve them, it is mostly to use the getter methods. For
example, when we want the basis vector for the reference frame of an
`OrientedPoint`.

Very sparingly one interacts on user scripts with this classes except to
retrieve some information from them , such as position or orientation, or to
use of the methods on them.


## Class: `Point`

The `Point` class provides basic functionality for positioning a point in 3D
space using a `THREE.Group` object.

### Properties

| Property     | Type             | Description                                                                 |
|--------------|------------------|-----------------------------------------------------------------------------|
| `geometry`   | `THREE.Group`    | The underlying Three.js object that stores the point's position and transformations. |
| `position`   | `Vector3`        | **Getter:** Returns the current position as a tuple `[x, y, z]`.  
 **Setter:** Sets the point's position in 3D space. |

---

## Class: `OrientedPoint` (Subclass of `Point`)

The `OrientedPoint` class extends `Point` and introduces orientation in 3D
space using quaternions. It also supports adding a camera to the point.

### Constructor

```typescript
constructor(geometry: THREE.Group, camera?: THREE.PerspectiveCamera)
```

| Parameter    | Type                     | Description                                                                 |
|--------------|--------------------------|-----------------------------------------------------------------------------|
| `geometry`   | `THREE.Group`            | A THREE.Group object representing the point in 3D space.                   |
| `camera`     | `THREE.PerspectiveCamera`| (Optional) A camera to be attached to the point.                           |

If a camera is provided, it is added to the point's THREE.Group and named
`_camera` for identification.

### Properties

| Property     | Type                  | Description                                                                 |
|--------------|-----------------------|-----------------------------------------------------------------------------|
| `frame`      | `{ x, y, z: Vector3 }`| Returns the local coordinate frame vectors (x, y, z) of the point. Each vector is represented as a tuple `[x, y, z]`. |
| `camera`     | `THREE.Camera \| null` | **Getter:** Returns the first attached camera named "Camera" in the point's group or `null` if no such camera exists. |

### Methods

#### `addCamera`

Adds a THREE.PerspectiveCamera with the specified field of view (FOV) to the
point's group.

| Parameters         | Type                    | Returns | Description                                                                 |
|--------------------|-------|-----------------|-----------------------------------------------------------------------------|
| `fov: number`      | `number`                | `void` | Full FOV of the camera in degrees |
|`camera_orientation`| `[number, number, number, number]` | `void` | Orientation of the camera with respect to the body frame. Defaults to the identity quaternion with the camera assumed to point in the +z direction. |

 Throws an error if a camera with the name "Camera" already exists. |


## Class: `Satellite` (Subclass of `OrientedPoint`)

The `Satellite` class extends `OrientedPoint` to represent satellites in orbit. It adds TLE (Two-Line Element) data management and automatic position/orientation updates based on time.

### Constructor

```typescript
constructor(geometry: THREE.Group, tle: string, orientationMode?: OrientationMode, camera_orientation?: [number, number, number, number])
```

| Parameter           | Type                              | Description                                                    |
|--------------------|-----------------------------------|----------------------------------------------------------------|
| `geometry`         | `THREE.Group`                     | A THREE.Group object representing the satellite in 3D space    |
| `tle`              | `string`                         | The Two-Line Element (TLE) data for the satellite             |
| `orientationMode`   | `OrientationMode`               | Defines how the satellite's orientation is determined           |
| `camera_orientation`| `[number, number, number, number]`| (Optional) Initial camera orientation quaternion defined in the satellite's body frame. If provided, a camera will be initialized and attached to the satellite. |

### Static Methods

#### `fromNoradId`

Creates a new Satellite instance by fetching TLE data using a NORAD ID.

```typescript
static async fromNoradId(
  geometry: THREE.Group,
  noradId: string,
  orientationMode: OrientationMode,
  camera_orientation?: [number, number, number, number]
): Promise<Satellite>
```

::: tip
Remember `fromNoradId` must always be `await`ed in user scripts.
:::

### Methods

#### `update`

Updates the satellite's position and orientation based on its TLE data for a given timestamp.

| Parameter   | Type     | Description                                     |
|------------|----------|-------------------------------------------------|
| `timestamp`| `Date`   | The time for which to calculate the position    |
| `state`    | `State`  | Application state containing required scene data |

Throws an error if TLE data cannot be parsed or if position calculation fails.

## OrientationMode

The `OrientationMode` type defines how a satellite's orientation is determined. It can be either:

### Fixed Orientation

```typescript
{ 
  type: 'fixed';
  ecef_quaternion: [number, number, number, number] 
}
```

Maintains a constant orientation in ECEF coordinates specified by a quaternion.

### Dynamic Orientation

```typescript
{
  type: 'dynamic';
  primaryBodyVector: Vector3 | string;
  secondaryBodyVector: Vector3 | string;
  primaryTargetVector: Vector3 | NamedTargets;
  secondaryTargetVector: Vector3 | NamedTargets;
}
```

Continuously updates orientation to align body vectors with target vectors:
- `primaryBodyVector`: Body frame vector to align (typically 'x', 'y', or 'z')
- `secondaryBodyVector`: Secondary body frame vector for full attitude determination
- `primaryTargetVector`: Target direction for primary alignment
- `secondaryTargetVector`: Target direction for secondary alignment

### Named Targets

The following named targets are available for dynamic orientation:

| Target    | Description                                     |
|-----------|------------------------------------------------|
| `Moon`    | Direction to the Moon                          |
| `Sun`     | Direction to the Sun                           |
| `Velocity`| Satellite's velocity vector                    |
| `Nadir`   | Direction to Earth's center (pointing down)    |

## point

Returns a point in the scene state.

#### Arguments

| Parameter  | Type     | Description                     |
|------------|----------|---------------------------------|
| `point`    | `string` | The name of the point.          |

#### Returns

A `Point`, `OrientedPoint`, or `Satellite` instance.

#### Example

```javascript
// Calculate the angle between the x-axis of the `sat` point
// and the nadir direction
angle("nadir", point("sat").frame.x);
