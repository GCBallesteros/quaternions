# Class: `OrientedPoint` (Subclass of `Point`)

The `OrientedPoint` class extends `Point` and introduces orientation in 3D
space using quaternions. It also supports adding a camera to the point.

## Camera Configuration

The `CameraConfig` interface defines the configuration for cameras attached to points:

```typescript
interface CameraConfig {
  orientation: Vector4;  // Quaternion defining camera orientation
  fov: number;           // Field of view in degrees
};
```

## Constructor

```typescript
constructor(geometry: THREE.Group, cameraConfig?: CameraConfig)
```

| Parameter     | Type          | Description                                                    |
|--------------|---------------|----------------------------------------------------------------|
| `geometry`   | `THREE.Group` | A THREE.Group object representing the point in 3D space        |
| `cameraConfig`| `CameraConfig`| (Optional) Configuration for the attached camera               |

If a camera configuration is provided, a camera will be added to the point's THREE.Group and named
`_camera` for identification. The camera will be oriented according to the provided configuration.

## Properties

| Property     | Type                  | Description                                                                 |
|--------------|-----------------------|-----------------------------------------------------------------------------|
| `frame`      | `{ x, y, z: Vector3 }`| Returns the local coordinate frame vectors (x, y, z) of the point. Each vector is represented as a tuple `[x, y, z]`. |
| `camera`     | `THREE.Camera \| null` | **Getter:** Returns the first attached camera named "Camera" in the point's group or `null` if no such camera exists. |

## Methods

### `addCamera`

Adds a THREE.PerspectiveCamera to the point's group using the provided configuration.

```typescript
addCamera(config: CameraConfig): void
```

| Parameter | Type          | Description                                                    |
|-----------|---------------|----------------------------------------------------------------|
| `config`  | `CameraConfig`| Configuration object containing camera orientation and FOV      |

The camera will be oriented according to the configuration's orientation quaternion and use the specified field of view.
Throws an error if a camera named "_camera" already exists in the group.
