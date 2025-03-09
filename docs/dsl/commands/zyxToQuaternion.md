# zyxToQuaternion

Converts Euler angles (yaw, pitch, roll) to a quaternion.

The `zyxToQuaternion` function converts Euler angles in ZYX order (yaw, pitch, roll) to a quaternion representation. This is a common conversion in aerospace and robotics applications.

The rotation order is important: rotations are applied in the order Z-Y-X, which means:
1. First rotation: Yaw (around Z axis)
2. Second rotation: Pitch (around Y axis)
3. Third rotation: Roll (around X axis)

This is equivalent to the aerospace convention of yaw-pitch-roll, where the rotations are applied in that specific order.

## Syntax

```typescript
zyxToQuaternion(
  { yaw, pitch, roll }: { yaw: number; pitch: number; roll: number },
  degrees: boolean = true
): [number, number, number, number]
```

## Parameters

| Parameter | Description |
|-----------|-------------|
| `angles`  | An object containing the Euler angles: `{ yaw, pitch, roll }` |
| `degrees` | (Optional) Whether the angles are in degrees (true) or radians (false). Default is true. |

## Returns

A quaternion as a 4-element array `[x, y, z, w]` representing the rotation.


## Examples

### Converting degrees to quaternion

```javascript
// Convert 90° yaw, 45° pitch, 0° roll to quaternion
const quaternion = zyxToQuaternion({ yaw: 90, pitch: 45, roll: 0 });
log(quaternion); // Outputs something like [0.3826, 0.3826, 0.1913, 0.8269]
```

### Using radians

```javascript
// Convert π/2 yaw, π/4 pitch, 0 roll to quaternion (in radians)
const quaternion = zyxToQuaternion(
  { yaw: Math.PI/2, pitch: Math.PI/4, roll: 0 }, 
  false // specify that we're using radians
);
log(quaternion);
```

### Using the quaternion for rotation

```javascript
// Create a point and rotate it using Euler angles
addPoint("satellite", [7000, 0, 0]);

// Convert Euler angles to quaternion
const quaternion = zyxToQuaternion({ yaw: 30, pitch: 45, roll: 60 });

// Apply the rotation
rot("satellite", quaternion);
```

## Related

- [`rot`](/dsl/commands/rot) - Rotates a point using a quaternion
- [`relativeRot`](/dsl/commands/relativeRot) - Applies a relative rotation to a point
