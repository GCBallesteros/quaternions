# addPoint

Adds a new point to the scene at specified coordinates.

The `addPoint` function creates a new point in the scene at the specified coordinates. If a quaternion is provided, the point will be created as an `OrientedPoint` with the specified orientation, which includes a basis frame.

Points created with this function can be referenced by name in other commands, such as `mov`, `rot`, or `createLine`.

## Syntax

```typescript
addPoint(
  name: string,
  coordinates: Array3 | Vector3,
  quaternion: Array4 | null = null,
  color: string = '#ffffff'
): Point | OrientedPoint
```

## Parameters

| Parameter     | Description                                                                 |
|---------------|-----------------------------------------------------------------------------|
| `name`        | The name of the point to create.                                            |
| `coordinates` | The position as a 3-element array `[x, y, z]` or Vector3 object.            |
| `quaternion`  | (Optional) Initial rotation as quaternion `[x, y, z, w]`. Default is null.  |
| `color`       | (Optional) Color of the point in hex format. Default is white.              |

## Returns

`Point | OrientedPoint` - The newly created point.

## Examples

### Adding a simple point

```javascript
// Add a point named "target" at coordinates [6371, 0, 0]
addPoint("target", [6371, 0, 0]);
```

### Adding a point with a specific orientation and color

```javascript
// Add a red point with a specific orientation
addPoint("oriented_point", [6371, 0, 0], [0, 0, 0, 1], '#ff0000');
```

### Adding a point using geographic coordinates

```javascript
// Convert geographic coordinates to Cartesian
const position = geo2xyz([60.17, 24.94, 0]);
// Add a point at Helsinki, Finland
const helsinki = addPoint("helsinki", position);
```

### Storing the returned point

```javascript
// Create a point and store the reference
const myPoint = addPoint("myPoint", [6371, 0, 0]);

// Now you can directly work with the point object
log(`Position: ${myPoint.position}`);
myPoint.color = "#00ff00";
```

## Related

- [`point`](/dsl/commands/point) - Retrieves a point by name
- [`deletePoint`](/dsl/commands/deletePoint) - Removes a point from the scene
- [`mov`](/dsl/commands/mov) - Moves a point to a specific position
