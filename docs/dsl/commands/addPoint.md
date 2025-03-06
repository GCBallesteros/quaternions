# addPoint

Adds a new point to the scene at specified coordinates.

## Syntax

```javascript
addPoint(name, coordinates, quaternion = null, color = '#ffffff')
```

## Parameters

| Parameter     | Type                | Description                                          |
|---------------|---------------------|------------------------------------------------------|
| `name`        | `string`            | Name of the point                                    |
| `coordinates` | `Array3` or `Vector3` | Cartesian coordinates `[x, y, z]`                    |
| `quaternion`  | `Vector4` or `null` | (Optional) Initial rotation as quaternion `[x, y, z, w]`. Default is null. |
| `color`       | `string`            | (Optional) Color of the point in hex format. Default is white. |

## Returns

`void` - This function doesn't return a value.

## Description

The `addPoint` function creates a new point in the scene at the specified coordinates. If a quaternion is provided, the point will be created as an `OrientedPoint` with the specified orientation, which includes a basis frame.

Points created with this function can be referenced by name in other commands, such as `mov`, `rot`, or `createLine`.

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
addPoint("helsinki", position);
```

## Related

- [`point`](/dsl/commands/point) - Retrieves a point by name
- [`deletePoint`](/dsl/commands/deletePoint) - Removes a point from the scene
- [`mov`](/dsl/commands/mov) - Moves a point to a specific position
