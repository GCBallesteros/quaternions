# deletePoint

Removes a point from the scene.

The `deletePoint` function removes a point from the scene by its name. It also removes any lines that reference this point. This is useful for cleaning up the scene or removing temporary points that are no longer needed.

## Syntax

```typescript
deletePoint(name: string)
```

## Parameters

| Parameter | Description                           |
|-----------|---------------------------------------|
| `name`    | The name of the point to delete.      |

## Returns

`void`

## Examples

### Deleting a simple point

```javascript
// Delete a point named "target"
deletePoint("target");
```

### Checking if a point exists before deleting

```javascript
// Check if the point exists before deleting
const points = listPoints();
if (points.includes("target")) {
  deletePoint("target");
  log("Point 'target' has been deleted");
} else {
  log("Point 'target' does not exist");
}
```

### Deleting a point after use

```javascript
// Create a temporary point
addPoint("temp", [6371, 0, 0]);

// Use the point for some operations
// ...

// Delete the point when done
deletePoint("temp");
```

## Related

- [`addPoint`](/dsl/commands/addPoint) - Adds a new point to the scene
- [`listPoints`](/dsl/commands/listPoints) - Lists all points in the scene
- [`reset`](/dsl/commands/reset) - Resets the scene to its initial state
