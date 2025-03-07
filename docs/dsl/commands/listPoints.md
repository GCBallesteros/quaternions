# listPoints

Returns a list of all point names in the scene

The `listPoints` function returns an array containing the names of all points
currently in the scene.  This includes regular points, oriented points, and
satellite

This function is useful for discovering what points are available in the
current scene, especially whe working with a complex scene or when you need to
iterate through all points.


## Syntax

```javascript
listPoints(): string[]
```

## Parameters

None

## Returns

`string[]` - An array of strings containing the names of all points in the scene.


## Examples

### Getting all point names

```javascript
// Get all point names
const points = listPoints();
log(`Available points: ${points.join(', ')}`);
```

### Iterating through all points

```javascript
// Iterate through all points and log their positions
const pointNames = listPoints();
for (const name of pointNames) {
  const p = point(name);
  log(`${name} position: ${p.position}`);
}
```

### Checking if a point exists

```javascript
// Check if a specific point exists
const pointNames = listPoints();
if (pointNames.includes('target')) {
  log('Target point exists');
} else {
  log('Target point does not exist');
  // Create the point if needed
  addPoint('target', [6371, 0, 0]);
}
```

## Related

- [`point`](/dsl/commands/point) - Retrieves a point by name
- [`addPoint`](/dsl/commands/addPoint) - Adds a new point to the scene
- [`deletePoint`](/dsl/commands/deletePoint) - Removes a point from the scene
