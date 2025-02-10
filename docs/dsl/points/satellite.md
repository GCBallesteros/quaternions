# Class: `Satellite` (Subclass of `OrientedPoint`)

The `Satellite` class extends `OrientedPoint` to represent satellites in orbit. It adds TLE (Two-Line Element) data management and automatic position/orientation updates based on time.

## Constructor

```typescript
constructor(geometry: THREE.Group, tle: string, orientationMode?: OrientationMode, cameraConfig?: CameraConfig)
```

| Parameter        | Type           | Description                                                    |
|-----------------|----------------|----------------------------------------------------------------|
| `geometry`      | `THREE.Group`  | A THREE.Group object representing the satellite in 3D space    |
| `tle`           | `string`       | The Two-Line Element (TLE) data for the satellite             |
| `orientationMode`| `OrientationMode`| Defines how the satellite's orientation is determined       |
| `cameraConfig`  | `CameraConfig` | (Optional) Configuration for the satellite's camera            |

## Static Methods

### `fromNoradId`

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

## Methods

### `update`

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

### NamedTargets

The following named targets are available for dynamic orientation:

| Target    | Description                                     |
|-----------|------------------------------------------------|
| `Moon`    | Direction to the Moon                          |
| `Sun`     | Direction to the Sun                           |
| `Velocity`| Satellite's velocity vector                    |
| `Nadir`   | Direction to Earth's center (pointing down)    |
| `TargetPointing`   | Points towards a specific target. Either an existing point reference by name or a fixed ECEF coordinate    |

Using `TargetPointing` requires passing additional data unlike the others.

### Example

Some targets are fully specified by the simulation like `Moon` or `Nadir` and can
simply be used as:

```js
NamedTarget.Moon
```

However, if we want to point at a specific target we need to supply that too:

```js
// Always point towards the default sat. The point must have been added before.
NamedTarget.TargetPointing("sat");
// or perhaps look at a fixed point in space
NamedTarget.TargetPointing([2000, 3000, 3000]);
```

## addSatellite

Adds a new satellite to the scene with specified TLE data and orientation mode.

### Arguments

| Parameter        | Type             | Description                                                    |
|-----------------|------------------|----------------------------------------------------------------|
| `name`          | `string`         | Unique identifier for the satellite                            |
| `tleSource`     | `TleSource`      | Source of TLE data (either direct TLE or NORAD ID)            |
| `orientationMode`| `OrientationMode`| Configuration for how the satellite maintains its orientation  |

### TleSource

Can be either:
```typescript
{ type: 'tle'; tle: string }
// or
{ type: 'noradId'; noradId: string }
```

### Returns

`Promise<void>` - Must be awaited.

### Example

```javascript
// Add a satellite using its NORAD ID
await addSatellite(
  'sentinel2b',
  {
    type: 'noradId',
    noradId: '42063',
  },
  {
    type: 'dynamic',
    primaryBodyVector: 'z',
    secondaryBodyVector: 'y',
    primaryTargetVector: NamedTargets.Nadir,
    secondaryTargetVector: NamedTargets.Velocity,
  }
);

// Or using direct TLE data
await addSatellite(
  'mysat',
  {
    type: 'tle',
    tle: `ISS (ZARYA)
1 25544U 98067A   08264.51782528 -.00002182  00000-0 -11606-4 0  2927
2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.72125391563537`
  },
  {
    type: 'dynamic',
    primaryBodyVector: 'z',
    secondaryBodyVector: 'y',
    primaryTargetVector: NamedTargets.Moon,
    secondaryTargetVector: NamedTargets.Velocity,
  }
);
```

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
