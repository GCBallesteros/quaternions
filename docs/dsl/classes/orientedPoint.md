# Class: OrientedPoint

The `OrientedPoint` class extends `Point` and introduces orientation in 3D space using quaternions. It also supports adding a camera to the point.

::: warning
OrientedPoints should be created using the [`addPoint`](/dsl/commands/addPoint) function with a quaternion parameter, not by directly instantiating the `OrientedPoint` class. Manipulating the internal properties directly might lead to inconsistent application state.
:::

## Properties

Inherits all properties from [`Point`](/dsl/classes/point).

## Getters

### frame

```typescript
get frame(): { x: Array3, y: Array3, z: Array3 }
```

Returns the local coordinate frame vectors (x, y, z) of the point. Each vector is represented as a tuple `[x, y, z]`.

### camera

```typescript
get camera(): THREE.Camera | null
```

Returns the first attached camera named "_camera" in the point's group or `null` if no such camera exists.

### hasCamera

```typescript
get hasCamera(): boolean
```

Returns `true` if the point has a camera attached, `false` otherwise.

### cameraBodyAxis

```typescript
get cameraBodyAxis(): { direction: Array3 }
```

Returns the direction vector of the camera in the body frame, typically the z-axis.

## Methods

### addCamera

```typescript
addCamera(config: CameraConfig): void
```

Adds a THREE.PerspectiveCamera to the point's group using the provided configuration.

| Parameter | Type           | Description                                                    |
|-----------|----------------|----------------------------------------------------------------|
| `config`  | `CameraConfig` | Configuration object containing camera orientation and FOV      |

The camera will be oriented according to the configuration's orientation quaternion and use the specified field of view. Throws an error if a camera named "_camera" already exists in the group.

See the [`CameraConfig`](/dsl/types/cameraConfig) documentation for details on the configuration options.

## Usage

OrientedPoints are typically created using the [`addPoint`](/dsl/commands/addPoint) function with a quaternion parameter, or by using the [`rot`](/dsl/commands/rot) command on an existing point:

```javascript
// Create an oriented point
addPoint("orientedPoint", [6371, 0, 0], [0, 0, 0, 1]);

// Access the oriented point
const myPoint = point("orientedPoint");

// Access the frame vectors
const xAxis = myPoint.frame.x;
const yAxis = myPoint.frame.y;
const zAxis = myPoint.frame.z;

// Add a camera with 45-degree field of view
myPoint.addCamera({
  orientation: [0, 0, 0, 1],
  fov: 45
});

// Switch to the point's camera view
if (myPoint.hasCamera) {
  switchCamera(myPoint.camera);
}
```
