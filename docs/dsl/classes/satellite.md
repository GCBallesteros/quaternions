# Class: Satellite

The `Satellite` class extends `OrientedPoint` to represent satellites in orbit. It adds TLE (Two-Line Element) data management and automatic position/orientation updates based on time.

::: warning
Satellites should be created using the [`addSatellite`](/dsl/commands/addSatellite) command, not by directly instantiating the `Satellite` class. Manipulating the internal properties directly might lead to inconsistent application state.
:::

## Properties

Inherits all properties from [`OrientedPoint`](/dsl/classes/orientedPoint).

| Property    | Type           | Description                                                    |
|-------------|----------------|----------------------------------------------------------------|
| `trail`     | `Trail \| null` | The satellite's trail visualization, or null if not enabled    |
| `hasTrail`  | `boolean`      | Whether the satellite has a trail enabled                      |

## Methods

### enableTrail

```typescript
enableTrail(): void
```

Enables the satellite's trail visualization.

### disableTrail

```typescript
disableTrail(): void
```

Disables the satellite's trail visualization.

## Orientation Configuration

The `Satellite` class uses two important types to configure its orientation:

- [`OrientationMode`](/dsl/types/orientationMode) - Defines how the satellite maintains its orientation (fixed or dynamic)
- [`NamedTargets`](/dsl/types/namedTargets) - Defines special target vectors for dynamic orientation

See their respective documentation pages for detailed information.

## Usage

Satellites are typically created using the [`addSatellite`](/dsl/commands/addSatellite) command:

```javascript
// Add a satellite using its NORAD ID
await addSatellite(
  'sentinel2b',
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

// Access the satellite
const sat = point("sentinel2b");

// Enable trail visualization
if (sat instanceof Satellite) {
  sat.enableTrail();
}

// Add a camera and switch to its view
sat.addCamera({
  orientation: [0, 0, 0, 1],
  fov: 45
});
switchCamera(sat.camera);
```

::: note
The `Satellite` class has additional internal methods like `constructor`, `update`, and `fromNoradId` that are used by the application but should not be called directly by users.
:::

