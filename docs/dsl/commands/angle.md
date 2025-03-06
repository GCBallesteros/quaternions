# angle

Calculates the angle between two vectors.

## Syntax

```javascript
angle(vector1, vector2)
```

## Parameters

| Parameter | Type                | Description                           |
|-----------|---------------------|---------------------------------------|
| `vector1` | `string` or `Array3` | First vector                          |
| `vector2` | `string` or `Array3` | Second vector                         |

## Returns

`number` - The angle between the vectors in degrees.

## Description

The `angle` function calculates the angle between two vectors in 3D space. The vectors can be specified in several ways:

1. A 3-element array representing the vector: `[x, y, z]`
2. The name of a previously created line
3. A string of the form `"pointA->pointB"` to define a vector between two points
4. For oriented points, you can access their frame vectors (e.g., `point("sat").frame.z`)

The function returns the angle in degrees, with a range from 0° (vectors are parallel) to 180° (vectors are antiparallel).

## Examples

### Using explicit vectors

```javascript
// Calculate angle between two explicit vectors
const angleValue = angle([1, 0, 0], [0, 1, 0]);
log(`Angle: ${angleValue} degrees`); // Should be 90 degrees
```

### Using line names

```javascript
// Create two lines
createLine("lineA", "pointA", "pointB");
createLine("lineB", "pointA", "pointC");

// Calculate angle between the lines
const angleValue = angle("lineA", "lineB");
log(`Angle between lines: ${angleValue} degrees`);
```

### Using point-to-point notation

```javascript
// Calculate angle between two vectors defined by points
const angleValue = angle("sat->Moon", "sat->Earth");
log(`Angle between vectors: ${angleValue} degrees`);
```

### Using frame vectors

```javascript
// Calculate angle between a satellite's z-axis and a target
const sat = point("sat");
const angleToTarget = angle(sat.frame.z, "sat->target");
log(`Pointing error: ${angleToTarget} degrees`);
```

## Related

- [`createLine`](/dsl/commands/createLine) - Creates a line between two points
- [`point`](/dsl/commands/point) - Retrieves a point by name
