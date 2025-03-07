# point

Retrieves a point from the scene by name.

The `point` function retrieves a point from the scene by its name. It returns
the point object, which can be a `Point`, `OrientedPoint`, or `Satellite`
instance depending on how the point was created. If no point with the given
name exists, it returns null.

This function is useful for accessing properties and methods of points, such as
their position, orientation, or frame vectors.

## Syntax

```javascript
point(name: string): Point | OrientedPoint | Satellite | null
```

## Parameters

| Parameter | Type     | Description                           |
|-----------|----------|---------------------------------------|
| `name`    | `string` | The name of the point to retrieve     |

## Returns

`Point | OrientedPoint | Satellite | null` - The point object if found, or null if not found.


## Examples

### Accessing a point's position

```javascript
const sat = point("sat");
if (sat) {
  // Get the position of the point
  const position = sat.position;
  log(`Position: ${position}`);
}
```

### Working with an oriented point's frame

```javascript
const orientedPoint = point("satellite");
if (orientedPoint) {
  // Access the local frame vectors
  const xAxis = orientedPoint.frame.x;
  const yAxis = orientedPoint.frame.y;
  const zAxis = orientedPoint.frame.z;
  
  // Calculate angle between z-axis and a target
  const angleToTarget = angle("satellite->target", zAxis);
  log(`Angle to target: ${angleToTarget} degrees`);
}
```

### Checking if a point exists

```javascript
const myPoint = point("myPoint");
if (myPoint === null) {
  log("Point not found");
  // Create the point
  addPoint("myPoint", [6371, 0, 0]);
}
```

## Related

- [`addPoint`](/dsl/commands/addPoint) - Adds a new point to the scene
- [`deletePoint`](/dsl/commands/deletePoint) - Removes a point from the scene
- [`Point`](/dsl/classes/point) - Point class documentation
- [`OrientedPoint`](/dsl/classes/orientedPoint) - OrientedPoint class documentation
- [`Satellite`](/dsl/classes/satellite) - Satellite class documentation
