# rot

Rotates a point to match the orientation specified by a quaternion.

The `rot` function rotates a point to match the orientation implied by the
provided quaternion. The quaternion is specified in the format `[x, y, z, w]`
and represents the absolute orientation in the Earth-Centered Earth-Fixed
(ECEF) frame.

This function is particularly useful for setting the attitude of satellites or
oriented points in the scene.

## Syntax

```javascript
rot(point_name: string, quaternion: Array4)
```

## Parameters

| Parameter    | Description                                   |
|--------------|-----------------------------------------------|
| `point_name` | The name of the point to rotate.              |
| `quaternion` | A quaternion `[x, y, z, w]` for the rotation. |

## Returns

`void`

## Examples

### Setting a specific orientation

```javascript
// Rotate the point "sat" to a specific orientation
rot("sat", [0, 0, 0, 1]);
```

### Using with findBestQuaternion

Often rotations can be established based on some desired attitude we can be
obtained for example from
[`findBestQuaternion`](/dsl/commands/findBestQuaternion)

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
