# removePlot

Removes a plot from the display.

The `removePlot` function removes a previously created plot from the display and cleans up associated resources.

## Syntax

```typescript
removePlot(id: string): void
```

## Parameters

| Parameter | Description                                         |
|-----------|-----------------------------------------------------|
| `id`      | The unique identifier of the plot to be removed.    |

## Returns

`void`

## Examples

### Removing a specific plot

```javascript
// Create a plot
createPlot(
  'satellite-altitude', {
    title: "Satellite Altitude",
    lines: ["altitude"],
  },
  () => {
    const sat = point("satellite1");
    if (!sat) return [0];
    const [lat, lon, alt] = xyz2geo(sat.position);
    return [alt];
  }
);

// Later, remove the plot when no longer needed
removePlot('satellite-altitude');
```

### Removing plots during cleanup

```javascript
// Remove plots as part of a reset function
function cleanupVisualization() {
  // Remove specific plots
  removePlot('orientation-plot');
  removePlot('altitude-plot');
  
  // Reset the scene
  reset(true); // true means also clean up all plots
}
```

## Related

- [`createPlot`](/dsl/commands/createPlot) - Creates a new plot with the specified configuration
- [`reset`](/dsl/commands/reset) - Resets the scene and optionally cleans up all plots
