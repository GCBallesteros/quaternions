# addSatellite

Adds a new satellite to the scene with specified TLE data and orientation mode.

## Syntax

```javascript
async addSatellite(name, tleSource, orientationMode, cameraConfig?)
```

## Parameters

| Parameter        | Type             | Description                                                    |
|------------------|------------------|----------------------------------------------------------------|
| `name`           | `string`         | Unique identifier for the satellite                            |
| `tleSource`      | `TleSource`      | Source of TLE data (either direct TLE or NORAD ID)            |
| `orientationMode`| `OrientationMode`| Configuration for how the satellite maintains its orientation  |
| `cameraConfig`   | `CameraConfig`   | (Optional) Configuration for the satellite's camera            |

### TleSource

Can be either:
```typescript
{ type: 'tle'; tle: string }
// or
{ type: 'noradId'; noradId: string }
```

### OrientationMode

Can be either:

#### Fixed Orientation
```typescript
{ 
  type: 'fixed';
  ecef_quaternion: [number, number, number, number] 
}
```

#### Dynamic Orientation
```typescript
{
  type: 'dynamic';
  primaryBodyVector: Vector3 | string;
  secondaryBodyVector: Vector3 | string;
  primaryTargetVector: Vector3 | NamedTargets;
  secondaryTargetVector: Vector3 | NamedTargets;
}
```

### CameraConfig
```typescript
{
  orientation: [number, number, number, number]; // Quaternion
  fov: number; // Field of view in degrees
}
```

## Returns

`Promise<void>` - This function must be awaited.

## Description

The `addSatellite` function creates a new satellite in the scene using the specified TLE data and orientation configuration. The satellite's position is determined by its TLE data and the current simulation time, while its orientation is controlled by the provided orientation mode.

This function is asynchronous and must be awaited, as it may need to fetch TLE data from external sources.

## Examples

### Adding a satellite using its NORAD ID

```javascript
// Add a satellite using its NORAD ID with nadir pointing
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
```

### Adding a satellite with a camera

```javascript
// Add a satellite with a camera attached
await addSatellite(
  'imaging_sat',
  {
    type: 'noradId',
    noradId: '60562',
  },
  {
    type: 'dynamic',
    primaryBodyVector: 'z',
    secondaryBodyVector: 'y',
    primaryTargetVector: NamedTargets.Nadir,
    secondaryTargetVector: NamedTargets.Velocity,
  },
  {
    orientation: [0, 0, 0, 1],
    fov: 45
  }
);
```

## Related

- [`mov2sat`](/dsl/commands/mov2sat) - Moves a point to a satellite's position
- [`fetchTLE`](/dsl/commands/fetchTLE) - Fetches TLE data for a satellite
- [`Satellite`](/dsl/classes/satellite) - Satellite class documentation
