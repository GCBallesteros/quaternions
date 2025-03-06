# Interfaces & Types Overview

The What on Earth? application uses several interfaces and types to define configuration options and specialized data structures.

## Interface & Type Reference

- **[`CameraConfig`](/dsl/types/cameraConfig)** defines the configuration options for cameras attached to points, including orientation and field of view.

- **[`OrientationMode`](/dsl/types/orientationMode)** defines how a satellite's orientation is determined (fixed or dynamic).

- **[`NamedTargets`](/dsl/types/namedTargets)** defines special target vectors for satellite orientation, such as the Moon, Sun, or Nadir.

## Usage

These interfaces and types are primarily used as configuration parameters when creating or modifying objects in the scene:

```javascript
// Using CameraConfig when adding a camera to a point
myPoint.addCamera({
  orientation: [0, 0, 0, 1], // Identity quaternion
  fov: 45
});

// Using OrientationMode and NamedTargets when creating a satellite
await addSatellite(
  'earth_observer',
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
