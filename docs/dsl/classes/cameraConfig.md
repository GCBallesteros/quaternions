# CameraConfig Interface

The `CameraConfig` interface defines the configuration for cameras attached to points in the scene.

::: warning
This interface is used internally by the application when adding cameras to points. Users should not create instances of this interface directly, but instead use it when calling the `addCamera` method on an `OrientedPoint` or when creating points with cameras.
:::

## Properties

| Property      | Type      | Description                                                    |
|---------------|-----------|----------------------------------------------------------------|
| `orientation` | `Vector4` | Quaternion defining camera orientation as `[x, y, z, w]`       |
| `fov`         | `number`  | Field of view in degrees                                       |

## Usage

The `CameraConfig` interface is used when adding a camera to an `OrientedPoint`:

```javascript
// Get an oriented point
const myPoint = point("orientedPoint");

// Add a camera with 45-degree field of view
myPoint.addCamera({
  orientation: [0, 0, 0, 1], // Identity quaternion (no rotation)
  fov: 45
});
```

It can also be provided when creating a point with a camera:

```javascript
// Create a point with a camera attached
addPoint("cameraPoint", [6371, 0, 0], [0, 0, 0, 1], "#ff0000", {
  orientation: [0, 0, 0, 1],
  fov: 60
});
```

## Related

- [`OrientedPoint`](/dsl/classes/orientedPoint) - OrientedPoint class that uses CameraConfig
- [`addCamera`](/dsl/commands/addCamera) - Method to add a camera to an OrientedPoint
