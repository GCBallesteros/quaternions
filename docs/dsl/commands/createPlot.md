# createPlot

Creates a new plot with the specified configuration and data source.

The `createPlot` function creates a dynamic plot that can display real-time
data. You provide a configuration object to define the plot's appearance
(title and lines) and a callback function that provides the data to be plotted.

The plot evolves in real time with the simulation. If the simulation is paused,
the plot won't update. You can get more or less fine-grained plots by adjusting
the simulation time speed - slower simulation speeds will result in more detailed
plots, while faster speeds will show broader trends.

## Syntax

```typescript
createPlot(
  id: string,
  config: {
    title: string;
    lines: string[];
    sampleEvery?: number
  },
  callback: () => number[]
): void
```

## Parameters

| Parameter  | Description                                                                 |
|------------|-----------------------------------------------------------------------------|
| `id`       | A unique identifier for the plot. Used to reference the plot later.         |
| `config`   | Configuration object for the plot (see below).                              |
| `callback` | A function that returns an array of numbers to be plotted. Called periodically during simulation. |

### Config Object

| Property      | Description                                                                 |
|---------------|-----------------------------------------------------------------------------|
| `title`       | The title displayed at the top of the plot.                                 |
| `lines`       | Array of string labels for each line in the plot. The number of lines must match the number of values returned by the callback. |
| `sampleEvery` | (Optional) Number of frames to wait between samples. Higher values result in less frequent updates but better performance. Default is 10. |

## Returns

`void`

## Examples

### Plotting satellite orientation quaternion components

```javascript
createPlot(
  'sat1-orientation', {
    title: "Satellite Orientation",
    lines: ["qw", "qx", "qy", "qz"],
    sampleEvery: 20 // Sample every 20 frames
  },
  () => {
    const sat = point("hf1a");
    return sat.geometry.quaternion.toArray();
  }
);
```

### Plotting distance between two points

```javascript
createPlot(
  'distance-plot', {
    title: "Distance Between Earth and Satellite",
    lines: ["distance"],
    sampleEvery: 5
  },
  () => {
    const earth = point("earth");
    const sat = point("satellite1");
    
    if (!earth || !sat) return [0];
    
    const earthPos = new THREE.Vector3(...earth.position);
    const satPos = new THREE.Vector3(...sat.position);
    
    return [earthPos.distanceTo(satPos)];
  }
);
```

## Related

- [`removePlot`](/dsl/commands/removePlot) - Removes a plot from the display
