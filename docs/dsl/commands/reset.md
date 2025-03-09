# reset

Resets the scene to its initial state.

The `reset` function clears the scene and returns it to its initial state. This includes:

- Removing all user-added points, lines, and satellites
- Resetting the camera to its default position
- Restoring the default Earth and reference objects
- Optionally removing all plots if `cleanupPlots` is set to true

This function is particularly useful at the beginning of scripts to ensure a clean starting state.

## Syntax

```typescript
reset(cleanupPlots: boolean = false): void
```

## Parameters

| Parameter      | Description                                                    |
|----------------|----------------------------------------------------------------|
| `cleanupPlots` | (Optional) Whether to also remove plots. Default is false.     |

## Returns

`void`

## Examples

### Basic reset

```javascript
// Reset the scene to its initial state
reset();
```

### Reset including plots

```javascript
// Reset the scene and remove all plots
reset(true);
```

### Using reset at the beginning of a script

```javascript
// Start with a clean scene
reset();

// Now add new elements
addPoint("target", [6371, 0, 0]);
createLine("line1", "sat", "target");
```

## Related

- [`addPoint`](/dsl/commands/addPoint) - Adds a new point to the scene
- [`deletePoint`](/dsl/commands/deletePoint) - Removes a point from the scene
- [`removePlot`](/dsl/commands/removePlot) - Removes a data plot
