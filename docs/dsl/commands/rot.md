# rot

Rotates a point to match the orientation specified by a quaternion.

## Syntax

```javascript
rot(point_name, quaternion)
```

## Parameters

| Parameter    | Type     | Description                                   |
|--------------|----------|-----------------------------------------------|
| `point_name` | `string` | The name of the point to rotate.              |
| `quaternion` | `Vector4`| A quaternion `[x, y, z, w]` for the rotation. |

## Returns

`void` - This function doesn't return a value.

## Description

The `rot` function rotates a point to match the orientation implied by the provided quaternion. The quaternion is specified in the format `[x, y, z, w]` and represents the absolute orientation in the Earth-Centered Earth-Fixed (ECEF) frame.

This function is particularly useful for setting the attitude of satellites or oriented points in the scene.

## Examples

### Setting a specific orientation

```javascript
// Rotate the point "sat" to a specific orientation
rot("sat", [0, 0, 0, 1]);
```

### Using with findBestQuaternion

```javascript
// Find the optimal quaternion to point at a target
const quaternion = findBestQuaternion(
  "z",                // Primary body vector
  "y",                // Secondary body vector
  "sat->target",      // Primary target vector
  [0, 0, 1]           // Secondary target vector
);

// Apply the calculated quaternion
rot("sat", quaternion);
```

## Related

- [`relativeRot`](/dsl/commands/relativeRot) - Applies a relative rotation to a point
- [`findBestQuaternion`](/dsl/commands/findBestQuaternion) - Computes optimal quaternion for alignment
