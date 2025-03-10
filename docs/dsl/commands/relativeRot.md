# relativeRot

Applies a relative rotation to a point.

The `relativeRot` function rotates a point by applying a quaternion relative to
its current orientation. This is different from `rot`, which sets the absolute
orientation.

This function is particularly useful when you want to incrementally adjust a
point's orientation rather than setting it to a specific absolute orientation.

## Syntax

```typescript
relativeRot(point_name: string, quaternion: Vector4)
```

## Parameters

| Parameter     | Description                                                    |
|---------------|----------------------------------------------------------------|
| `point_name`  | The name of the point to rotate.                               |
| `quaternion`  | A quaternion `[x, y, z, w]` representing the relative rotation.|

## Returns

`void`

## Examples

### Applying a relative rotation

```javascript
// Apply a 90-degree rotation around the Z axis to "sat"
const q = zyxToQuaternion({yaw: 90, pitch: 0, roll: 0}, true);
relativeRot("sat", q);
```

### Incremental rotations

```javascript
// Apply multiple small rotations incrementally
for (let i = 0; i < 10; i++) {
  // Rotate 10 degrees around Y axis each time
  const q = zyxToQuaternion({yaw: 0, pitch: 10, roll: 0}, true);
  relativeRot("sat", q);
}
```

## Related

- [`rot`](/dsl/commands/rot) - Sets the absolute orientation of a point
- [`zyxToQuaternion`](/dsl/commands/zyxToQuaternion) - Converts Euler angles to quaternion
