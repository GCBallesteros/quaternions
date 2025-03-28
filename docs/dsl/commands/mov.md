# mov

Moves a named point to a specific position in 3D space.

The `mov` function moves a point to a specified position in 3D space. The
position can be specified either as Cartesian coordinates (ECEF) or as
geographic coordinates (latitude, longitude, altitude).

If `use_geo` is set to `true`, the position is interpreted as geographic coordinates:
- First element: Latitude in degrees
- Second element: Longitude in degrees
- Third element: Altitude in kilometers above Earth's surface

If `use_geo` is `false` (default), the position is interpreted as Cartesian
coordinates in the Earth-Centered Earth-Fixed (ECEF) frame.

## Syntax

```typescript
mov(point_name: string, position: Array3 | Vector3, use_geo: bool = false)
```

## Parameters

| Parameter     | Description                                                                 |
|---------------|-----------------------------------------------------------------------------|
| `point_name`  | The name of the point to move.                                              |
| `position`    | The position as a 3-element array `[x, y, z]` or Vector3 object.           |
| `use_geo`     | (Optional) If true, interprets position as geographic coordinates `[latitude, longitude, altitude]`. Default is false. |

## Returns

`void`

## Examples

### Moving a point using Cartesian coordinates

```javascript
// Move the point "sat" to Cartesian coordinates [6371, 0, 0]
mov("sat", [6371, 0, 0]);
```

### Moving a point using geographic coordinates

```javascript
// Move the point "sat" to Helsinki, Finland at 500km altitude
mov("sat", [60.17, 24.94, 500], true);
```

## Related

- [`addPoint`](/dsl/commands/addPoint) - Adds a new point to the scene
- [`point`](/dsl/commands/point) - Retrieves a point by name
