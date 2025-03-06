# createLine

Creates a line between two points or coordinates.

## Syntax

```javascript
createLine(name, start, end)
```

## Parameters

| Parameter | Type                | Description                           |
|-----------|---------------------|---------------------------------------|
| `name`    | `string`            | Name of the line                      |
| `start`   | `string` or `Array3` | Starting point name or coordinates    |
| `end`     | `string` or `Array3` | Ending point name or coordinates      |

## Returns

`void` - This function doesn't return a value.

## Description

The `createLine` function creates a visible line between two points in the scene. Both the start and end points can be specified either as the name of an existing point or as explicit coordinates.

Lines created with this function can be referenced by name in other commands, such as the `angle` function.

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
