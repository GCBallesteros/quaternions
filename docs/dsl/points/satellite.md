# Class: Satellite

The `Satellite` class extends `OrientedPoint` to represent satellites in orbit. It adds TLE (Two-Line Element) data management and automatic position/orientation updates based on time.

## Constructor

```typescript
constructor(geometry: THREE.Group, tle: string, orientationMode?: OrientationMode, cameraConfig?: CameraConfig)
```

| Parameter         | Type             | Description                                                    |
|-------------------|------------------|----------------------------------------------------------------|
| `geometry`        | `THREE.Group`    | A THREE.Group object representing the satellite in 3D space    |
| `tle`             | `string`         | The Two-Line Element (TLE) data for the satellite              |
| `orientationMode` | `OrientationMode`| Defines how the satellite's orientation is determined          |
| `cameraConfig`    | `CameraConfig`   | (Optional) Configuration for the satellite's camera            |

## Static Methods

### fromNoradId

```typescript
static async fromNoradId(
  geometry: THREE.Group,
  noradId: string,
  orientationMode: OrientationMode,
  camera_orientation?: [number, number, number, number]
): Promise<Satellite>
```

Creates a new Satellite instance by fetching TLE data using a NORAD ID.

::: tip
Remember `fromNoradId` must always be `await`ed in user scripts.
:::

## Properties

Inherits all properties from [`OrientedPoint`](/dsl/classes/orientedPoint).

| Property    | Type           | Description                                                    |
|-------------|----------------|----------------------------------------------------------------|
| `trail`     | `Trail \| null` | The satellite's trail visualization, or null if not enabled    |
| `hasTrail`  | `boolean`      | Whether the satellite has a trail enabled                      |

## Methods

### update

```typescript
update(timestamp: Date, state: State): void
```

Updates the satellite's position and orientation based on its TLE data for a given timestamp.

| Parameter    | Type     | Description                                     |
|--------------|----------|-------------------------------------------------|
| `timestamp`  | `Date`   | The time for which to calculate the position    |
| `state`      | `State`  | Application state containing required scene data |

Throws an error if TLE data cannot be parsed or if position calculation fails.

### enableTrail

```typescript
enableTrail(): void
```

Enables the satellite's trail visualization.

### disableTrail

```typescript
disableTrail(): void
```

Disables the satellite's trail visualization.

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
  offset?: [number, number, number, number]; // Optional quaternion offset
}
```

Continuously updates orientation to align body vectors with target vectors:
- `primaryBodyVector`: Body frame vector to align (typically 'x', 'y', or 'z')
- `secondaryBodyVector`: Secondary body frame vector for full attitude determination
- `primaryTargetVector`: Target direction for primary alignment
- `secondaryTargetVector`: Target direction for secondary alignment
- `offset`: Optional quaternion offset to apply after the main alignment

## NamedTargets

The following named targets are available for dynamic orientation:

| Target           | Description                                                                 |
|------------------|-----------------------------------------------------------------------------|
| `Moon`           | Direction to the Moon                                                       |
| `Sun`            | Direction to the Sun                                                        |
| `Velocity`       | Satellite's velocity vector                                                 |
| `Nadir`          | Direction to Earth's center (pointing down)                                 |
| `TargetPointing` | Points towards a specific target (point name or ECEF coordinates)           |

## Usage

Satellites are typically created using the [`addSatellite`](/dsl/commands/addSatellite) command:

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

// Access the satellite
const sat = point("sentinel2b");

// Enable trail visualization
if (sat instanceof Satellite) {
  sat.enableTrail();
}

// Add a camera and switch to its view
sat.addCamera({
  orientation: [0, 0, 0, 1],
  fov: 45
});
switchCamera(sat.camera);
```

