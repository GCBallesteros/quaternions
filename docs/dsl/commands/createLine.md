# createLine

Creates a line between two points or coordinates.

The `createLine` function creates a visible line between two points in the
scene. Both the start and end points can be specified either as the name of an
existing point or as explicit coordinates.

Lines created with this function can be referenced by name in other commands,
such as the `angle` function.

## Syntax

```javascript
createLine(
  name: string,
  start: string | Array3 | Vector3,
  end: string | Array3 | Vector3,
)
```

## Parameters

| Parameter | Description                           |
|-----------|---------------------------------------|
| `name`    | Name of the line                      |
| `start`   | Starting point name or coordinates    |
| `end`     | Ending point name or coordinates      |

## Returns

`void`

## Examples

### Creating a line between two named points

```javascript
// Create a line between two existing points
createLine("line1", "pointA", "pointB");
```

### Creating a line between a point and coordinates

```javascript
// Create a line from a point to specific coordinates
createLine("line2", "sat", [6371, 0, 0]);
```

### Creating a line between explicit coordinates

```javascript
// Create a line between two sets of coordinates
createLine("line3", [6371, 0, 0], [0, 6371, 0]);
```

## Related

- [`angle`](/dsl/commands/angle) - Calculates the angle between two vectors
- [`addPoint`](/dsl/commands/addPoint) - Adds a new point to the scene
