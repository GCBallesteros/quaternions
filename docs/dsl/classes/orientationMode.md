# OrientationMode Type

The `OrientationMode` type defines how a satellite's orientation is determined in 3D space. It is used by the `Satellite` class to control how the satellite maintains its attitude as it orbits Earth.

::: warning
This type is used internally by the application when creating satellites. Users should not create instances of this type directly, but instead provide the appropriate configuration when calling the [`addSatellite`](/dsl/commands/addSatellite) command.
:::

## Type Definition

The `OrientationMode` type is a union type that can be either:

### Fixed Orientation

```typescript
{ 
  type: 'fixed';
  ecef_quaternion: Vector4 
}
```

Maintains a constant orientation in Earth-Centered Earth-Fixed (ECEF) coordinates specified by a quaternion.

| Property         | Type      | Description                                                    |
|------------------|-----------|----------------------------------------------------------------|
| `type`           | `'fixed'` | Identifies this as a fixed orientation mode                    |
| `ecef_quaternion`| `Vector4` | Quaternion `[x, y, z, w]` defining the fixed orientation       |

### Dynamic Orientation

```typescript
{
  type: 'dynamic';
  primaryBodyVector: Vector3 | string;
  secondaryBodyVector: Vector3 | string;
  primaryTargetVector: Vector3 | NamedTargets;
  secondaryTargetVector: Vector3 | NamedTargets;
  offset?: Vector4; // Optional quaternion offset
}
```

Continuously updates orientation to align body vectors with target vectors.

| Property               | Type                       | Description                                                    |
|------------------------|----------------------------|----------------------------------------------------------------|
| `type`                 | `'dynamic'`               | Identifies this as a dynamic orientation mode                   |
| `primaryBodyVector`    | `Vector3 \| string`        | Body frame vector to align (typically 'x', 'y', or 'z')        |
| `secondaryBodyVector`  | `Vector3 \| string`        | Secondary body frame vector for full attitude determination     |
| `primaryTargetVector`  | `Vector3 \| NamedTargets`  | Target direction for primary alignment                          |
| `secondaryTargetVector`| `Vector3 \| NamedTargets`  | Target direction for secondary alignment                        |
| `offset`               | `Vector4`                  | (Optional) Additional quaternion offset to apply after alignment|

## Usage

The `OrientationMode` is used when creating a satellite:

```javascript
// Create a satellite with fixed orientation
await addSatellite(
  'fixed_sat',
  {
    type: 'noradId',
    noradId: '25544',
  },
  {
    type: 'fixed',
    ecef_quaternion: [0, 0, 0, 1], // Identity quaternion
  }
);

// Create a satellite with dynamic orientation
await addSatellite(
  'dynamic_sat',
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
    offset: [0, 0, 0, 1], // Optional additional rotation
  }
);
```

## Related

- [`NamedTargets`](/dsl/classes/namedTargets) - Special targets for dynamic orientation
- [`Satellite`](/dsl/classes/satellite) - Satellite class that uses OrientationMode
- [`addSatellite`](/dsl/commands/addSatellite) - Command to add a satellite to the scene
