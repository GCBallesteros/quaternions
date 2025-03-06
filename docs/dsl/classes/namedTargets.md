# NamedTargets Type

The `NamedTargets` type defines special target vectors that can be used for satellite orientation. These targets represent common reference directions in space, such as the direction to the Moon, the Sun, or the satellite's velocity vector.

::: warning
This type is used internally by the application when creating satellites with dynamic orientation. Users should not create instances of this type directly, but instead use the predefined constants in the `NamedTargets` namespace.
:::

## Type Definition

The `NamedTargets` type is a union type that can be one of the following:

```typescript
type NamedTargets =
  | { type: 'Moon' }
  | { type: 'Sun' }
  | { type: 'Velocity' }
  | { type: 'Nadir' }
  | { type: 'TargetPointing'; target: Array3 | string | Vector3 };
```

## Predefined Constants

The `NamedTargets` namespace provides predefined constants for common targets:

| Constant        | Description                                                                 |
|-----------------|-----------------------------------------------------------------------------|
| `Moon`          | Direction from the satellite to the Moon                                    |
| `Sun`           | Direction from the satellite to the Sun                                     |
| `Velocity`      | Satellite's velocity vector                                                 |
| `Nadir`         | Direction from the satellite to Earth's center (pointing down)              |
| `TargetPointing`| Function that creates a target pointing to a specific point or coordinates  |

## Usage

The `NamedTargets` constants are used when defining a satellite's dynamic orientation:

```javascript
// Create a satellite pointing its z-axis at Earth (nadir pointing)
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

// Create a satellite pointing its z-axis at the Moon
await addSatellite(
  'moon_observer',
  {
    type: 'noradId',
    noradId: '25544',
  },
  {
    type: 'dynamic',
    primaryBodyVector: 'z',
    secondaryBodyVector: 'y',
    primaryTargetVector: NamedTargets.Moon,
    secondaryTargetVector: NamedTargets.Velocity,
  }
);

// Create a satellite pointing its z-axis at a specific target point
await addSatellite(
  'target_tracker',
  {
    type: 'noradId',
    noradId: '25544',
  },
  {
    type: 'dynamic',
    primaryBodyVector: 'z',
    secondaryBodyVector: 'y',
    primaryTargetVector: NamedTargets.TargetPointing("groundStation"),
    secondaryTargetVector: NamedTargets.Velocity,
  }
);
```

### Using TargetPointing

The `TargetPointing` function creates a target that points towards a specific point or coordinates:

```javascript
// Point at a named point in the scene
NamedTargets.TargetPointing("groundStation")

// Point at specific coordinates [x, y, z]
NamedTargets.TargetPointing([6371, 0, 0])
```

## Related

- [`OrientationMode`](/dsl/classes/orientationMode) - Type that uses NamedTargets for satellite orientation
- [`Satellite`](/dsl/classes/satellite) - Satellite class that uses NamedTargets
- [`addSatellite`](/dsl/commands/addSatellite) - Command to add a satellite to the scene
